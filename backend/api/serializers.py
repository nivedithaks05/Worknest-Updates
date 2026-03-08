from rest_framework import serializers

from .models import User, Task, Announcement, Message, Skill, Career


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": False, "allow_blank": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            # If no password provided, set an unusable one
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        source="assigned_to",
        queryset=User.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "created_at",
            "assigned_to",
            "assigned_to_id",
        ]
        read_only_fields = ["id", "created_at", "assigned_to"]


class AnnouncementSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        source="author",
        queryset=User.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Announcement
        fields = [
          "id",
          "title",
          "content",
          "is_high_priority",
          "created_at",
          "author",
          "author_id",
        ]
        read_only_fields = ["id", "created_at", "author"]


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    sender_id = serializers.PrimaryKeyRelatedField(
        source="sender",
        queryset=User.objects.all(),
        write_only=True,
    )
    receiver_id = serializers.PrimaryKeyRelatedField(
        source="receiver",
        queryset=User.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "receiver",
            "sender_id",
            "receiver_id",
            "content",
            "timestamp",
            "is_read",
        ]
        read_only_fields = ["id", "timestamp", "sender", "receiver"]


class CareerInputSerializer(serializers.Serializer):
    skills = serializers.ListField(
        child=serializers.CharField(), allow_empty=True
    )
    interests = serializers.ListField(
        child=serializers.CharField(), allow_empty=True
    )
    education_level = serializers.CharField()


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class CareerSerializer(serializers.ModelSerializer):
    required_skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Career
        fields = [
            "id",
            "title",
            "description",
            "industry",
            "avg_salary",
            "growth_rate",
            "required_skills",
        ]
