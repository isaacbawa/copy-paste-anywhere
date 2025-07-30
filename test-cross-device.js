// Comprehensive test for serverless cross-device functionality
import { storage } from './shared/production-storage.js';

console.log('🧪 Testing Cross-Device Serverless Functionality\n');

// Simulate creating a clip on Device A
console.log('📱 Device A: Creating a clip...');
const deviceAClip = await storage.createClip({
    content: 'Hello from Device A! This should be accessible from Device B.',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
});

console.log(`✅ Device A: Created clip with ID: ${deviceAClip.id}`);
console.log(`📅 Device A: Clip expires at: ${deviceAClip.clip.expiresAt}`);

// Simulate some delay (like network request time)
console.log('\n⏳ Simulating network delay...');
await new Promise(resolve => setTimeout(resolve, 1000));

// Simulate accessing the clip from Device B
console.log('\n📱 Device B: Trying to access the clip...');
const deviceBClip = await storage.getClip(deviceAClip.id);

if (deviceBClip) {
    console.log('✅ Device B: Successfully retrieved clip!');
    console.log(`📄 Device B: Content: "${deviceBClip.content}"`);
    console.log(`⏰ Device B: Expires at: ${deviceBClip.expiresAt}`);
    console.log(`🕐 Device B: Created at: ${deviceBClip.createdAt}`);
} else {
    console.log('❌ Device B: Failed to retrieve clip - this indicates the storage issue!');
}

// Test revocation
console.log('\n🔒 Device A: Revoking the clip...');
const revoked = await storage.revokeClip(deviceAClip.id);

if (revoked) {
    console.log('✅ Device A: Clip revoked successfully');
    
    // Try to access revoked clip from Device B
    console.log('\n📱 Device B: Trying to access revoked clip...');
    const revokedClip = await storage.getClip(deviceAClip.id);
    
    if (revokedClip) {
        console.log('❌ Device B: ERROR - Should not be able to access revoked clip!');
    } else {
        console.log('✅ Device B: Correctly blocked from accessing revoked clip');
    }
} else {
    console.log('❌ Device A: Failed to revoke clip');
}

// Test expiry
console.log('\n⏰ Testing expiry functionality...');
const expiredClip = await storage.createClip({
    content: 'This clip should expire immediately',
    expiresAt: new Date(Date.now() - 1000) // 1 second ago
});

console.log(`📝 Created expired clip: ${expiredClip.id}`);

const retrievedExpired = await storage.getClip(expiredClip.id);
if (retrievedExpired) {
    console.log('❌ ERROR - Should not be able to access expired clip!');
} else {
    console.log('✅ Correctly blocked access to expired clip');
}

// Get storage stats
const stats = await storage.getStorageStats();
console.log('\n📊 Storage Statistics:');
console.log(`   Total clips: ${stats.totalClips}`);
console.log(`   Active clips: ${stats.activeClips}`);
console.log(`   Cache age: ${stats.cacheAge}ms`);

console.log('\n🎉 Cross-device functionality test completed!');
console.log('\n🚀 If all tests passed, the app should work perfectly between devices!');
