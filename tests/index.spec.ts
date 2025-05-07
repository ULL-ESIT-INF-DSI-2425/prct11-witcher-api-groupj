import { runGoodTests } from './good.spec.js';
import { runHunterTests } from './hunter.spec.js';
import { runMerchantTests } from './merchant.spec.js';
import { runTransactionTests } from './transaction.spec.js';
import { defaultRouterTests } from './default.spec.js';

defaultRouterTests();
runGoodTests();
runHunterTests();
runMerchantTests();
runTransactionTests();
