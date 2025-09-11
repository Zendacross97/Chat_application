const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const Group = require('../models/groupsModel');
const UserGroup = require('../models/userGroupsModel');
const GroupAdmin = require('../models/groupAdminModel');

//User and Chat models are associated such that a User can have many Chats, and each Chat belongs to a User.
User.hasMany(Chat);
Chat.belongsTo(User);

//Chat model is associated with User such that a Chat can have a sender and a receiver.
User.hasMany(Chat, { foreignKey: 'receiverId', as: 'ReceivedChats' });// one can access all chats received by a user via req.user.ReceivedChats
Chat.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });// one can access the receiver of a chat via chat.Receiver


//User and Group models are associated such that a User can belong to many Groups, and each Group can have many Users.
User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

// Add direct associations for eager loading
Group.hasMany(UserGroup, { foreignKey: 'groupId', as: 'userGroups' });
UserGroup.belongsTo(Group, { foreignKey: 'groupId' });
User.hasMany(UserGroup, { foreignKey: 'userId', as: 'userGroups' });
UserGroup.belongsTo(User, { foreignKey: 'userId' });

//Group and Chat models are associated such that a Group can have many Chats, and each Chat belongs to a Group.
Group.hasMany(Chat);
Chat.belongsTo(Group);

//Group and Admin models are associated such that a Group can have many Admins, and each Admin belongs to many Groups.
Group.belongsToMany(User, { through: GroupAdmin });
User.belongsToMany(Group, { through: GroupAdmin });

module.exports = {
    User,
    Chat,
    Group,
    UserGroup
};