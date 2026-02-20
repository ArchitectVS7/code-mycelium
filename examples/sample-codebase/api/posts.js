/**
 * Posts API endpoints
 */

export async function getPosts(limit = 20) {
  // Fetch posts from database
  const posts = await fetchPostsFromDatabase({ limit });
  
  // Transform for API response
  return posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    authorId: post.authorId
  }));
}

export async function getPostById(postId) {
  // Fetch single post
  const post = await fetchPostsFromDatabase({ id: postId });
  
  if (!post) {
    throw new Error('Post not found');
  }
  
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    authorId: post.authorId,
    createdAt: post.createdAt
  };
}

async function fetchPostsFromDatabase(query) {
  // Mock database fetch
  return {
    id: query.id || 1,
    title: 'Sample Post',
    content: 'This is a sample post',
    authorId: 1,
    createdAt: new Date()
  };
}
