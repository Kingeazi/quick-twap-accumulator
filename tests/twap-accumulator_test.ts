import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.4.1/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
    name: "Verify TWAP Accumulator Core Functionality",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const tester = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            // Initialize a trading pair
            Tx.contractCall('twap-accumulator', 'initialize-pair', 
                [types.ascii('STX-USDA'), types.uint(86400)], 
                deployer.address
            ),
            // Update price requires oracle permission
            Tx.contractCall('twap-accumulator', 'set-oracle-permission', 
                [types.principal(tester.address), types.bool(true)], 
                deployer.address
            ),
            // Update price multiple times
            Tx.contractCall('twap-accumulator', 'update-price', 
                [types.ascii('STX-USDA'), types.uint(10000000)], 
                tester.address
            )
        ]);

        // Verify initial operations
        assertEquals(block.height, 2);
        assertEquals(block.receipts.length, 3);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[2].result.expectOk().expectBool(true);
    }
});