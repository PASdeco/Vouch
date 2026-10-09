"""Shared test setup for Vouch direct-mode tests (Windows-safe).

Copied pattern from Roast: gltest 0.29.2 deletes its stdin temp file while
fd 0 still references it (POSIX-ok, Windows WinError 32). Defer delete.
"""
import inspect
import os


def _install_windows_stdin_shim() -> None:
    import gltest.direct.loader as loader
    import gltest.direct.vm as vm_mod

    if getattr(loader, "_vouch_stdin_shim_installed", False):
        return
    original_inject = getattr(loader, "_inject_message_to_fd0", None)
    original_cleanup = getattr(vm_mod.VMContext, "_cleanup_after_deactivate", None)
    if original_inject is None or original_cleanup is None:
        return
    source = inspect.getsource(original_inject)
    if not all(m in source for m in ("mkstemp", "entry_kind", "dup2")):
        print("\n[vouch conftest] gltest inject shape changed; shim NOT applied.")
        return

    def patched_inject(vm):
        import tempfile

        try:
            from genlayer.py import calldata
            from genlayer.py.types import Address
        except ImportError:
            return
        sender_addr = vm.sender
        if isinstance(sender_addr, bytes):
            sender_addr = Address(sender_addr)
        contract_addr = vm._contract_address
        if isinstance(contract_addr, bytes):
            contract_addr = Address(contract_addr)
        origin_addr = vm.origin
        if isinstance(origin_addr, bytes):
            origin_addr = Address(origin_addr)
        message_data = {
            "contract_address": contract_addr,
            "sender_address": sender_addr,
            "origin_address": origin_addr,
            "stack": [],
            "value": vm._value,
            "datetime": vm._datetime,
            "is_init": False,
            "chain_id": vm._chain_id,
            "entry_kind": 0,
            "entry_data": b"",
            "entry_stage_data": None,
        }
        encoded = calldata.encode(message_data)
        fd, path = tempfile.mkstemp()
        try:
            os.write(fd, encoded)
            os.lseek(fd, 0, os.SEEK_SET)
            original_stdin = os.dup(0)
            vm._original_stdin_fd = original_stdin
            os.dup2(fd, 0)
        finally:
            os.close(fd)
            try:
                os.unlink(path)
            except OSError:
                vm._roast_deferred_unlink = path

    def patched_cleanup(self):
        path = getattr(self, "_roast_deferred_unlink", None)
        try:
            original_cleanup(self)
        finally:
            if path:
                try:
                    os.unlink(path)
                except OSError:
                    pass
                self._roast_deferred_unlink = None

    loader._inject_message_to_fd0 = patched_inject
    vm_mod.VMContext._cleanup_after_deactivate = patched_cleanup
    loader._vouch_stdin_shim_installed = True


_install_windows_stdin_shim()

import pytest


@pytest.fixture()
def vouch_contract(direct_vm, direct_deploy, direct_alice):
    direct_vm.sender = direct_alice
    return direct_deploy("contracts/vouch_escrow.py")
