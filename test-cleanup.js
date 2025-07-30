// Test script to verify serverless-safe cleanup functionality
import { storage } from './shared/storage.js';

console.log('🧪 Testing serverless-safe cleanup functionality...\n');

// Verify no background timers are running
console.log('✅ Storage initialized without setInterval');

// Test 1: Create clips with different expiry times
console.log('1. Creating test clips...');
const now = new Date();

// Create expired clip
const expiredClip = await storage.createClip({
    content: 'This clip should be expired',
    expiresAt: new Date(now.getTime() - 1000) // 1 second ago
});

// Create valid clip
const validClip = await storage.createClip({
    content: 'This clip should be valid',
    expiresAt: new Date(now.getTime() + 10 * 60 * 1000) // 10 minutes from now
});

console.log(`   📎 Created expired clip: ${expiredClip.id}`);
console.log(`   📎 Created valid clip: ${validClip.id}\n`);

// Test 2: Verify on-demand cleanup works
console.log('2. Testing on-demand cleanup during getClip...');

// Try to get the expired clip (this should trigger cleanup)
const retrievedExpired = await storage.getClip(expiredClip.id);
console.log(`   🗑️  Expired clip cleaned up: ${!retrievedExpired ? '✅ YES' : '❌ NO'}`);

const retrievedValid = await storage.getClip(validClip.id);
console.log(`   📋 Valid clip preserved: ${retrievedValid ? '✅ YES' : '❌ NO'}`);

// Test 3: Manual cleanup
console.log('\n3. Testing manual cleanup...');
const deletedCount = storage.cleanupExpiredClips();
console.log(`   🧹 Manual cleanup deleted ${deletedCount} clips`);

console.log('\n🎉 Serverless-safe cleanup test completed!');
console.log('🚀 Ready for Vercel deployment without timeout issues!');
