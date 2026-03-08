from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = "Admin", "Admin"
        MANAGER = "Manager", "Manager"
        EMPLOYEE = "Employee", "Employee"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.EMPLOYEE,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "todo", "To Do"
        IN_PROGRESS = "inprogress", "In Progress"
        DONE = "done", "Done"

    class Priority(models.TextChoices):
        HIGH = "high", "High"
        MEDIUM = "medium", "Medium"
        LOW = "low", "Low"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )

    def __str__(self):
        return self.title


class Announcement(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_high_priority = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="announcements",
    )

    def __str__(self):
        return self.title


class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_messages",
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver} at {self.timestamp}"


class Skill(models.Model):
    """
    Atomic skill used for AI career matching.
    """

    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Career(models.Model):
    """
    Represents a career path that WorkNest AI can recommend.
    """

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    required_skills = models.ManyToManyField(Skill, related_name="careers", blank=True)
    avg_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    growth_rate = models.FloatField(
        help_text="Expected growth rate in %, e.g. 12.5", null=True, blank=True
    )
    industry = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.title

class RoomMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="room_messages",
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"RoomMessage {self.id} from {self.sender} at {self.timestamp}"

