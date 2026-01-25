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
      // --- [YAHAN BADLAV KIYA GAYA HAI] ---
      // Ab hum saare users ka data (sirf zaroori fields) ek hi query mein le aayenge.
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        // Aakhri message bhi le aao
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, 
        },
      },
    });

    // lastMessage ko root level par move kar dein taaki frontend ko aasani ho
    const finalChats = chats.map(chat => {
        // Receiver user ko find karein
        const receiver = chat.users.find(user => user.id !== tokenUserId);
        return {
            ...chat,
            receiver: receiver, // Receiver object ko add karein
            lastMessage: chat.messages[0]?.text || "" // lastMessage ko 'messages' array se nikaalein
        }
    });

    res.status(200).json(finalChats);
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
      // --- [YAHAN BADLAV KIYA GAYA HAI] ---
      // Yahi hai Hackathon winning feature.
      // Messages ke saath-saath users aur post ki details bhi bhejo.
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        // Users ki details (username/avatar)
        users: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        // Property ki details (context ke liye)
        post: { // Yeh tabhi kaam karega jab aapne Step 2 (schema update) kiya hai
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          }
        }
      },
      // --- [END BADLAV] ---
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }

    // Mark as seen
    // Check karein ki user pehle se seenBy mein hai ya nahi
    if (!chat.seenBy.includes(tokenUserId)) {
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          seenBy: { push: tokenUserId }, // 'set' ki jagah 'push' use karein
        },
      });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("Error in getChat:", err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

// ✅ Create new chat with Socket.IO notification
export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  // --- [YAHAN BADLAV KIYA GAYA HAI] ---
  const { receiverId, postId } = req.body; // Ab postId bhi accept karein
  // --- [END BADLAV] ---

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required" });
  }

  try {
    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        userIDs: { hasEvery: [tokenUserId, receiverId] },
        // --- [NAYA] ---
        // Check karein ki chat usi post ke liye hai ya nahi
        postId: postId || null, 
      },
    });

    if (existingChat) {
      console.log("Existing chat found, returning that.");
      return res.status(200).json(existingChat); // Avoid duplicates
    }

    // Nayi chat banayein
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, receiverId],
        seenBy: [tokenUserId], // Creator has seen it
        // --- [NAYA] ---
        postId: postId || null, // Post ID ko chat se link karein
      },
    });

    // ===== Socket.IO notification (Aapka logic sahi hai) =====
    const io = req.app.get("socketio");
    if (io) {
      io.to(receiverId).emit("newChat", newChat);
      io.to(tokenUserId).emit("newChat", newChat);
    }

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

    // Check karein ki user pehle se seenBy mein hai ya nahi
    if (!chat.seenBy.includes(tokenUserId)) {
        const updatedChat = await prisma.chat.update({
          where: { id: chatId },
          data: {
            seenBy: { push: tokenUserId }, // 'set' ki jagah 'push' use karein
          },
        });
        return res.status(200).json(updatedChat);
    }
    
    res.status(200).json(chat); // Agar pehle se read hai, toh bas chat return karein

  } catch (err) {
    console.error("Error in readChat:", err);
    res.status(500).json({ message: "Failed to mark chat as read!" });
  }
};