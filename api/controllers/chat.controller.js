import prisma from "../lib/prisma.js";

// ✅ Get all chats for logged-in user
export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get last message for preview
        },
      },
    });

    const enhancedChats = await Promise.all(
      chats.map(async (chat) => {
        const receiverId = chat.userIDs.find((id) => id !== tokenUserId);
        let receiver = null;

        if (receiverId) {
          receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { id: true, username: true, avatar: true },
          });
        }

        return {
          ...chat,
          receiver,
        };
      })
    );

    res.status(200).json(enhancedChats);
  } catch (err) {
    console.error("Error in getChats:", err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

// ✅ Get single chat by ID
export const getChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userIDs: {
          has: tokenUserId,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }

    // Mark as seen
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        seenBy: { set: [...new Set([...chat.seenBy, tokenUserId])] },
      },
    });

    res.status(200).json(chat);
  } catch (err) {
    console.error("Error in getChat:", err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

// ✅ Create new chat
export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required" });
  }

  try {
    // Check if chat already exists between users
    let existingChat = await prisma.chat.findFirst({
      where: {
        userIDs: { hasEvery: [tokenUserId, receiverId] },
      },
    });

    if (existingChat) {
      return res.status(200).json(existingChat); // Avoid duplicates
    }

    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, receiverId],
        seenBy: [tokenUserId], // Creator has seen it
      },
    });

    res.status(201).json(newChat);
  } catch (err) {
    console.error("Error in addChat:", err);
    res.status(500).json({ message: "Failed to add chat!" });
  }
};

// ✅ Mark chat as read
export const readChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;

  try {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        seenBy: { set: [...new Set([...chat.seenBy, tokenUserId])] },
      },
    });

    res.status(200).json(updatedChat);
  } catch (err) {
    console.error("Error in readChat:", err);
    res.status(500).json({ message: "Failed to mark chat as read!" });
  }
};
