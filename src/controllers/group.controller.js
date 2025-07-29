
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

export const createGroup = async (req, res) => {
  try {
    const { name, avatar, members, createdBy } = req.body;
    if (!name || !members || !createdBy) return res.status(400).json({ error: 'Missing fields' });
    const group = await Chat.create({
      isGroup: true,
      name,
      avatar,
      members,
      admins: [createdBy],
      createdBy,
      roles: members.map(uid => ({ user: uid, role: uid === createdBy ? 'admin' : 'member' }))
    });
    res.status(201).json(group);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const listGroups = async (req, res) => {
  try {
    const groups = await Chat.find({ isGroup: true });
    res.json(groups);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({ chat: groupId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, content, type, mentions } = req.body;
    const message = await Message.create({
      chat: groupId,
      sender: senderId,
      content,
      type,
      mention: mentions,
      status: 'sent'
    });
    await Chat.findByIdAndUpdate(groupId, { latestMessage: message._id });
    res.status(201).json(message);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const group = await Chat.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId, roles: { user: userId, role: 'member' } } },
      { new: true }
    );
    res.json(group);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, id } = req.params;
    const group = await Chat.findByIdAndUpdate(
      groupId,
      { $pull: { members: id, roles: { user: id } } },
      { new: true }
    );
    res.json(group);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, role } = req.body;
    if (!['admin', 'moderator', 'member'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const group = await Chat.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const roleObj = group.roles.find(r => r.user === userId);
    if (roleObj) roleObj.role = role;
    await group.save();
    res.json(group);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const group = await Chat.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId, roles: { user: userId } } },
      { new: true }
    );
    res.json(group);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
