// Edge Runtime compatibility test
import { storage } from './shared/edge-storage.js';

console.log('🧪 Testing Edge Runtime Compatible Storage\n');

// Test basic functionality
async function testStorage() {
    try {
        console.log('1. Testing clip creation...');
        const clip = await storage.createClip({
            content: 'Test content for Edge Runtime',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });
        
        console.log(`✅ Created clip: ${clip.id}`);
        
        console.log('2. Testing clip retrieval...');
        const retrieved = await storage.getClip(clip.id);
        
        if (retrieved) {
            console.log(`✅ Retrieved clip: ${retrieved.content}`);
        } else {
            console.log('❌ Failed to retrieve clip');
        }
        
        console.log('3. Testing storage stats...');
        const stats = await storage.getStorageStats();
        console.log(`📊 Stats: ${stats.totalClips} total, ${stats.activeClips} active`);
        
        console.log('4. Testing clip revocation...');
        const revoked = await storage.revokeClip(clip.id);
        console.log(`🚫 Revoked: ${revoked}`);
        
        const afterRevoke = await storage.getClip(clip.id);
        if (!afterRevoke) {
            console.log('✅ Correctly blocked revoked clip');
        } else {
            console.log('❌ Should not retrieve revoked clip');
        }
        
        console.log('\n🎉 Edge Runtime storage test completed successfully!');
        
    } catch (error) {
        console.error('❌ Edge Runtime test failed:', error);
    }
}

testStorage();
