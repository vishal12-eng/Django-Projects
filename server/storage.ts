import {
  users,
  posts,
  comments,
  blogs,
  products,
  gigs,
  gigOrders,
  messages,
  events,
  aiChats,
  type User,
  type UpsertUser,
  type InsertPost,
  type Post,
  type InsertComment,
  type Comment,
  type InsertBlog,
  type Blog,
  type InsertProduct,
  type Product,
  type InsertGig,
  type Gig,
  type InsertGigOrder,
  type GigOrder,
  type InsertMessage,
  type Message,
  type InsertEvent,
  type Event,
  type InsertAiChat,
  type AiChat,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Posts operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number): Promise<Post[]>;
  getUserPosts(userId: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  likePost(postId: string): Promise<void>;
  
  // Comments operations
  createComment(comment: InsertComment): Promise<Comment>;
  getPostComments(postId: string): Promise<Comment[]>;
  
  // Blog operations
  createBlog(blog: InsertBlog): Promise<Blog>;
  getUserBlogs(userId: string): Promise<Blog[]>;
  getPublishedBlogs(limit?: number): Promise<Blog[]>;
  getBlog(id: string): Promise<Blog | undefined>;
  updateBlog(id: string, blog: Partial<InsertBlog>): Promise<Blog>;
  
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(limit?: number): Promise<Product[]>;
  getUserProducts(userId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  
  // Gig operations
  createGig(gig: InsertGig): Promise<Gig>;
  getGigs(limit?: number): Promise<Gig[]>;
  getUserGigs(userId: string): Promise<Gig[]>;
  getGig(id: string): Promise<Gig | undefined>;
  
  // Gig order operations
  createGigOrder(order: InsertGigOrder): Promise<GigOrder>;
  getUserGigOrders(userId: string): Promise<GigOrder[]>;
  updateGigOrderStatus(id: string, status: string): Promise<GigOrder>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message }[]>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getUserEvents(userId: string): Promise<Event[]>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  
  // AI Chat operations
  createAiChat(aiChat: InsertAiChat): Promise<AiChat>;
  getUserAiChats(userId: string): Promise<AiChat[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Posts operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPosts(limit = 20): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async likePost(postId: string): Promise<void> {
    await db
      .update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(eq(posts.id, postId));
  }

  // Comments operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Update comments count on post
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, comment.postId));
    
    return newComment;
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  // Blog operations
  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [newBlog] = await db.insert(blogs).values(blog).returning();
    return newBlog;
  }

  async getUserBlogs(userId: string): Promise<Blog[]> {
    return await db
      .select()
      .from(blogs)
      .where(eq(blogs.userId, userId))
      .orderBy(desc(blogs.createdAt));
  }

  async getPublishedBlogs(limit = 20): Promise<Blog[]> {
    return await db
      .select()
      .from(blogs)
      .where(eq(blogs.published, true))
      .orderBy(desc(blogs.createdAt))
      .limit(limit);
  }

  async getBlog(id: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));
    if (blog) {
      // Increment views
      await db
        .update(blogs)
        .set({ views: sql`${blogs.views} + 1` })
        .where(eq(blogs.id, id));
    }
    return blog;
  }

  async updateBlog(id: string, blogData: Partial<InsertBlog>): Promise<Blog> {
    const [updatedBlog] = await db
      .update(blogs)
      .set({ ...blogData, updatedAt: new Date() })
      .where(eq(blogs.id, id))
      .returning();
    return updatedBlog;
  }

  // Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProducts(limit = 20): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.active, true))
      .orderBy(desc(products.createdAt))
      .limit(limit);
  }

  async getUserProducts(userId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.sellerId, userId))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  // Gig operations
  async createGig(gig: InsertGig): Promise<Gig> {
    const [newGig] = await db.insert(gigs).values(gig).returning();
    return newGig;
  }

  async getGigs(limit = 20): Promise<Gig[]> {
    return await db
      .select()
      .from(gigs)
      .where(eq(gigs.active, true))
      .orderBy(desc(gigs.createdAt))
      .limit(limit);
  }

  async getUserGigs(userId: string): Promise<Gig[]> {
    return await db
      .select()
      .from(gigs)
      .where(eq(gigs.userId, userId))
      .orderBy(desc(gigs.createdAt));
  }

  async getGig(id: string): Promise<Gig | undefined> {
    const [gig] = await db.select().from(gigs).where(eq(gigs.id, id));
    return gig;
  }

  // Gig order operations
  async createGigOrder(order: InsertGigOrder): Promise<GigOrder> {
    const [newOrder] = await db.insert(gigOrders).values(order).returning();
    
    // Update gig orders count
    await db
      .update(gigs)
      .set({ orders: sql`${gigs.orders} + 1` })
      .where(eq(gigs.id, order.gigId));
    
    return newOrder;
  }

  async getUserGigOrders(userId: string): Promise<GigOrder[]> {
    return await db
      .select()
      .from(gigOrders)
      .where(or(eq(gigOrders.buyerId, userId), eq(gigOrders.sellerId, userId)))
      .orderBy(desc(gigOrders.createdAt));
  }

  async updateGigOrderStatus(id: string, status: string): Promise<GigOrder> {
    const [updatedOrder] = await db
      .update(gigOrders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(gigOrders.id, id))
      .returning();
    return updatedOrder;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message }[]> {
    // This is a simplified version - in a real app, you'd want to optimize this query
    const userMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    const conversations = new Map<string, { user: User; lastMessage: Message }>();
    
    for (const message of userMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversations.has(otherUserId)) {
        const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
        if (otherUser) {
          conversations.set(otherUserId, { user: otherUser, lastMessage: message });
        }
      }
    }

    return Array.from(conversations.values());
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId))
      );
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.startDate));
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  // AI Chat operations
  async createAiChat(aiChat: InsertAiChat): Promise<AiChat> {
    const [newAiChat] = await db.insert(aiChats).values(aiChat).returning();
    return newAiChat;
  }

  async getUserAiChats(userId: string): Promise<AiChat[]> {
    return await db
      .select()
      .from(aiChats)
      .where(eq(aiChats.userId, userId))
      .orderBy(desc(aiChats.createdAt));
  }
}

export const storage = new DatabaseStorage();
