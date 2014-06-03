from django.contrib import admin
from .models import TodoEntry
# Register your models here.

class TodoEntryAdmin(admin.ModelAdmin):
    class Meta:
        model = TodoEntry

admin.site.register(TodoEntry, TodoEntryAdmin)