from django import forms

from .models import TodoEntry, PRIORITY

class TodoEntryForm(forms.ModelForm):
    """
    Todo Entry Form
    """
    form_name = 'entry_form'
    priority = forms.ChoiceField(choices=PRIORITY)

    def __init__(self, *args, **kwargs):
        kwargs.update(scope_prefix='entry')
        super(TodoEntryForm, self).__init__(*args, **kwargs)

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'priority')
