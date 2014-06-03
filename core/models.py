# encoding: utf-8

from tastypie.models import create_api_key

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _

PRIORITY = (
    (0, 'Low'),
    (1, 'Normal'),
    (2, 'High'),
    (3, 'Urgent')
)

class TodoEntry(models.Model):
    """
    Class for the todo list entry
    """
    title = models.CharField(max_length=255, verbose_name=_('Enter what to do'))
    due_date = models.DateField(verbose_name=_('Due date'))
    priority = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    user = models.ForeignKey(User)

    def __unicode__(self):
        return u'{.title}'.format(self)

    def to_json(self):
        return {
            'id': self.pk,
            'title': self.title,
            'due_date': self.due_date,
            'priority': self.priority,
            'order': self.order,
            'is_completed': self.is_completed
        }


models.signals.post_save.connect(create_api_key, sender=User)