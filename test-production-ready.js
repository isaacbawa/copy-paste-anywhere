// Complete end-to-end test for production deployment
import { storage } from './shared/edge-storage.js';

console.log('🚀 Production Deployment Readiness Test\n');

async function runCompleteTest() {
    const results = {
        createClip: false,
        crossDeviceAccess: false,
        realTimeExpiry: false,
        revocation: false,
        cleanup: false
    };

    try {
        // Test 1: Create Clip
        console.log('🔸 Test 1: Creating clip...');
        const clip1 = await storage.createClip({
            content: 'Hello from Device A! 📱',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });
        console.log(`✅ Clip created: ${clip1.id}`);
        results.createClip = true;

        // Test 2: Cross-Device Access (simulating different function instance)
        console.log('\n🔸 Test 2: Cross-device access...');
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
        
        const retrieved = await storage.getClip(clip1.id);
        if (retrieved && retrieved.content === 'Hello from Device A! 📱') {
            console.log('✅ Cross-device access working');
            results.crossDeviceAccess = true;
        } else {
            console.log('❌ Cross-device access failed');
        }

        // Test 3: Real-time Expiry
        console.log('\n🔸 Test 3: Real-time expiry...');
        const expiredClip = await storage.createClip({
            content: 'This should expire immediately',
            expiresAt: new Date(Date.now() - 1000) // Already expired
        });
        
        const expiredResult = await storage.getClip(expiredClip.id);
        if (!expiredResult) {
            console.log('✅ Real-time expiry working');
            results.realTimeExpiry = true;
        } else {
            console.log('❌ Real-time expiry failed');
        }

        // Test 4: Revocation
        console.log('\n🔸 Test 4: Clip revocation...');
        const revoked = await storage.revokeClip(clip1.id);
        if (revoked) {
            const revokedResult = await storage.getClip(clip1.id);
            if (!revokedResult) {
                console.log('✅ Revocation working');
                results.revocation = true;
            } else {
                console.log('❌ Revocation failed - clip still accessible');
            }
        } else {
            console.log('❌ Revocation failed - could not revoke');
        }

        // Test 5: Cleanup
        console.log('\n🔸 Test 5: Cleanup functionality...');
        const deletedCount = await storage.cleanupExpiredClips();
        console.log(`✅ Cleanup completed: ${deletedCount} clips removed`);
        results.cleanup = true;

        // Test 6: Storage Stats
        console.log('\n🔸 Test 6: Storage statistics...');
        const stats = await storage.getStorageStats();
        console.log(`📊 Storage stats: ${stats.totalClips} total, ${stats.activeClips} active`);

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }

    // Final Results
    console.log('\n📋 FINAL RESULTS:');
    console.log('==================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });

    const allPassed = Object.values(results).every(result => result);
    console.log('\n🎯 OVERALL RESULT:');
    console.log(allPassed ? '🎉 ALL TESTS PASSED - READY FOR PRODUCTION!' : '⚠️ SOME TESTS FAILED - NEEDS ATTENTION');

    return allPassed;
}

runCompleteTest();
