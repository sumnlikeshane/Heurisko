"""Current whole-TUI acceptance entry; historical receipts and old source are preserved."""
import runpy,pathlib
runpy.run_path(str(pathlib.Path(__file__).with_name('visual_audit.py')),run_name='__main__')
