// Test script to verify smart cleanup functionality
import { storage } from './shared/storage.js';

console.log('Testing smart cleanup functionality...\n');

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

console.log(`Created expired clip: ${expiredClip.id}`);
console.log(`Created valid clip: ${validClip.id}\n`);

// Test 2: Verify lazy cleanup works
console.log('2. Testing lazy cleanup...');
console.log(`Clips in storage before cleanup: ${storage.clips?.size || 'N/A'}`);

// Try to get the expired clip (this should trigger cleanup)
const retrievedExpired = await storage.getClip(expiredClip.id);
console.log(`Retrieved expired clip: ${retrievedExpired ? 'Found' : 'Not found (cleaned up)'}`);

const retrievedValid = await storage.getClip(validClip.id);
console.log(`Retrieved valid clip: ${retrievedValid ? 'Found' : 'Not found'}`);

// Test 3: Manual cleanup
console.log('\n3. Testing manual cleanup...');
const deletedCount = storage.cleanupExpiredClips();
console.log(`Manual cleanup deleted ${deletedCount} clips`);

console.log('\n✅ Smart cleanup test completed!');
