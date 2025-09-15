import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { generateBlogContent, generateContentIdeas, chatWithAI } from "./gemini";
import { 
  insertPostSchema, 
  insertCommentSchema, 
  insertBlogSchema,
  insertProductSchema,
  insertGigSchema,
  insertGigOrderSchema,
  insertMessageSchema,
  insertEventSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // PayPal routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Posts routes
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, upload.single('media'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({
        ...req.body,
        userId,
        mediaUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      });
      
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post('/api/posts/:id/like', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.likePost(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getPostComments(id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId: id,
        userId,
      });
      
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Blog routes
  app.get('/api/blogs', async (req, res) => {
    try {
      const blogs = await storage.getPublishedBlogs();
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get('/api/blogs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const blog = await storage.getBlog(id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ message: "Failed to fetch blog" });
    }
  });

  app.post('/api/blogs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blogData = insertBlogSchema.parse({
        ...req.body,
        userId,
      });
      
      const blog = await storage.createBlog(blogData);
      res.json(blog);
    } catch (error) {
      console.error("Error creating blog:", error);
      res.status(500).json({ message: "Failed to create blog" });
    }
  });

  app.post('/api/blogs/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { prompt, title } = req.body;
      const content = await generateBlogContent(prompt);
      
      const userId = req.user.claims.sub;
      const blog = await storage.createBlog({
        userId,
        title: title || "AI Generated Blog",
        content,
        aiGenerated: true,
        published: false,
      });
      
      res.json(blog);
    } catch (error) {
      console.error("Error generating blog:", error);
      res.status(500).json({ message: "Failed to generate blog content" });
    }
  });

  // Products routes
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: userId,
        fileUrl: files.file ? `/uploads/${files.file[0].filename}` : req.body.fileUrl,
        imageUrl: files.image ? `/uploads/${files.image[0].filename}` : req.body.imageUrl,
      });
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Gigs routes
  app.get('/api/gigs', async (req, res) => {
    try {
      const gigs = await storage.getGigs();
      res.json(gigs);
    } catch (error) {
      console.error("Error fetching gigs:", error);
      res.status(500).json({ message: "Failed to fetch gigs" });
    }
  });

  app.post('/api/gigs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gigData = insertGigSchema.parse({
        ...req.body,
        userId,
      });
      
      const gig = await storage.createGig(gigData);
      res.json(gig);
    } catch (error) {
      console.error("Error creating gig:", error);
      res.status(500).json({ message: "Failed to create gig" });
    }
  });

  app.post('/api/gigs/:id/order', isAuthenticated, async (req: any, res) => {
    try {
      const buyerId = req.user.claims.sub;
      const { id } = req.params;
      
      const gig = await storage.getGig(id);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      const orderData = insertGigOrderSchema.parse({
        gigId: id,
        buyerId,
        sellerId: gig.userId,
        amount: gig.price,
        ...req.body,
      });
      
      const order = await storage.createGigOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating gig order:", error);
      res.status(500).json({ message: "Failed to create gig order" });
    }
  });

  // Messages routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      const messages = await storage.getConversation(currentUserId, userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });
      
      const message = await storage.createMessage(messageData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            message,
          }));
        }
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Events routes
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse({
        ...req.body,
        userId,
      });
      
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // AI Assistant routes
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, chatType } = req.body;
      
      const response = await chatWithAI(message);
      
      await storage.createAiChat({
        userId,
        message,
        response,
        chatType: chatType || 'general',
      });
      
      res.json({ response });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });

  app.post('/api/ai/content-ideas', isAuthenticated, async (req, res) => {
    try {
      const { topic, type } = req.body;
      const ideas = await generateContentIdeas(topic, type);
      res.json({ ideas });
    } catch (error) {
      console.error("Error generating content ideas:", error);
      res.status(500).json({ message: "Failed to generate content ideas" });
    }
  });

  // User profile routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/users/:id/posts', async (req, res) => {
    try {
      const { id } = req.params;
      const posts = await storage.getUserPosts(id);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
