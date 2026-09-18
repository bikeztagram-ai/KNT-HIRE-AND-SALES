#!/usr/bin/env node
/** KNT AutoBot feature entrypoint: delegates to the proven Aider repository-map engine. */
import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['builder/runner/aider-feature-brain.mjs'],{cwd:process.cwd(),stdio:'inherit',env:process.env});
process.exit(result.error?1:(result.status??1));
