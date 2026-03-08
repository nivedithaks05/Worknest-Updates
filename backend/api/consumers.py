import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import RoomMessage

User = get_user_model()

class LiveChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "live_chat"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "chat_message":
            sender_id = data.get("sender_id")
            content = data.get("content")
            # Save to db
            msg = await self.create_message(sender_id, content)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "id": msg.id,
                    "sender_id": msg.sender.id,
                    "sender_name": msg.sender.username,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "action": "chat_message"
                }
            )
        elif action == "edit_message":
            msg_id = data.get("id")
            content = data.get("content")
            # Update in db
            msg = await self.update_message(msg_id, content)
            if msg:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "id": msg.id,
                        "content": msg.content,
                        "action": "edit_message"
                    }
                )
        elif action == "delete_message":
            msg_id = data.get("id")
            # Delete from db
            await self.delete_message(msg_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "id": msg_id,
                    "action": "delete_message"
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def create_message(self, sender_id, content):
        user = User.objects.get(id=sender_id)
        return RoomMessage.objects.create(sender=user, content=content)

    @database_sync_to_async
    def update_message(self, msg_id, content):
        try:
            msg = RoomMessage.objects.get(id=msg_id)
            msg.content = content
            msg.save()
            return msg
        except RoomMessage.DoesNotExist:
            return None

    @database_sync_to_async
    def delete_message(self, msg_id):
        try:
            msg = RoomMessage.objects.get(id=msg_id)
            msg.delete()
        except RoomMessage.DoesNotExist:
            pass
