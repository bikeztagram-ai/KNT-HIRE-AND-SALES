# KNT Builder Runner

The runner consumes only explicitly activated queue items, works on an isolated branch, persists checkpoints, runs verification, and reports evidence. It must not merge, deploy, weaken protected controls, or invent future work.

Execution agents are implementation workers; architecture and acceptance decisions remain outside the runner.
