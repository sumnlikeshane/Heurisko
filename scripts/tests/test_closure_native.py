"""Admission checks: emulation/remote context cannot become native evidence."""
import importlib.util
import os
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('closure_runner', Path(__file__).resolve().parents[1] / 'run-closure-validation.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class NativeAdmissionTests(unittest.TestCase):
    def setUp(self):
        self.node = {'node': 'v22.23.4', 'platform': 'linux', 'arch': 'x64'}
        self.engine = {'OSType': 'linux', 'Architecture': 'x86_64', 'OperatingSystem': 'Ubuntu 24.04'}

    def test_requires_host_node_and_local_engine_together(self):
        self.assertTrue(runner.native_admitted('Linux', 'x86_64', self.node, self.engine))
        for system, machine, node, engine in [
            ('Darwin', 'arm64', self.node, self.engine),
            ('Linux', 'aarch64', self.node, self.engine),
            ('Linux', 'x86_64', {**self.node, 'arch': 'arm64'}, self.engine),
            ('Linux', 'x86_64', {**self.node, 'platform': 'darwin'}, self.engine),
            ('Linux', 'x86_64', self.node, {**self.engine, 'Architecture': 'aarch64'}),
            ('Linux', 'x86_64', self.node, {**self.engine, 'OperatingSystem': 'Docker Desktop'}),
            ('Linux', 'x86_64', {}, {}),
        ]:
            with self.subTest(system=system, machine=machine, node=node, engine=engine):
                self.assertFalse(runner.native_admitted(system, machine, node, engine))

    def test_ambient_remote_engine_cannot_select_admission_endpoint(self):
        with patch.dict(os.environ, {'DOCKER_HOST': 'tcp://unrelated.example:2376', 'DOCKER_CONTEXT': 'remote-amd64'}):
            self.assertEqual(runner.local_docker_command('Linux'), ['docker', '--host', 'unix:///var/run/docker.sock', 'info', '--format', '{{json .}}'])
            self.assertEqual(runner.local_docker_command('Darwin', Path('/test-home'))[1:3], ['--host', 'unix:///test-home/.docker/run/docker.sock'])
        with self.assertRaises(ValueError):
            runner.local_docker_command('Windows')

    def test_all_pinned_tools_are_required(self):
        self.assertTrue(runner.tools_pinned(self.node, '10.14.0', 'Python 3.13.2', (3, 13, 2)))
        for node, pnpm, python, version in [
            ({**self.node, 'node': 'v26.10.0'}, '10.14.0', 'Python 3.13.2', (3, 13, 2)),
            (self.node, '10.15.0', 'Python 3.13.2', (3, 13, 2)),
            (self.node, '10.14.0', 'Python 3.12.9', (3, 13, 2)),
            (self.node, '10.14.0', 'Python 3.13.2', (3, 12, 9)),
        ]:
            self.assertFalse(runner.tools_pinned(node, pnpm, python, version))


if __name__ == '__main__':
    unittest.main()
