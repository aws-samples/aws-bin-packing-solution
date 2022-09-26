import { main } from '@tools/cfn-nag';
import * as path from 'path';

(async () => {
  await main({
    pathToProjectRootDirectory: path.resolve('../../../..'),
  });
})();
