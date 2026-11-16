/**
 * Inquiry form behaviour: validation, package preselection, and submission.
 *
 * Contract: the visitor is ONLY told their inquiry was sent when the
 * Web3Forms API responds with HTTP 2xx and `{ success: true }`. Anything
 * else (network error, timeout, API error) shows an error and keeps the
 * visitor's input intact.
 */

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const SUBMIT_TIMEOUT_MS = 15_000;

const labelFor = (control: Control) =>
  control.labels?.[0]?.childNodes[0]?.textContent?.trim().toLowerCase() ?? 'this field';

function messageFor(control: Control): string {
  const { validity } = control;
  if (validity.valueMissing) {
    return control instanceof HTMLSelectElement ? `Please choose an ${labelFor(control)}.` : `Please enter your ${labelFor(control)}.`;
  }
  if (validity.typeMismatch && control.type === 'email') return 'Please enter a valid email address, like name@example.com.';
  if (validity.rangeUnderflow) return 'Please choose a date that is today or later.';
  if (validity.tooLong) return 'That is a little too long. Please shorten it.';
  if (validity.customError) return control.validationMessage;
  return validity.valid ? '' : 'Please check this field.';
}

/** Optional phone: if provided, it should contain at least 7 digits. */
function applyCustomRules(control: Control) {
  if (control.name !== 'phone') return;
  const digits = control.value.replace(/\D/g, '');
  control.setCustomValidity(control.value && digits.length < 7 ? 'Please enter a valid phone number, or leave it blank.' : '');
}

function showError(form: HTMLFormElement, control: Control): boolean {
  applyCustomRules(control);
  const message = messageFor(control);
  const error = form.querySelector<HTMLElement>(`[data-error-for="${control.id}"]`);
  control.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) {
    error.textContent = message;
    error.hidden = !message;
  }
  return !message;
}

function preselectPackage(select: HTMLSelectElement, packageId: string | null | undefined) {
  if (!packageId) return;
  const option = select.querySelector<HTMLOptionElement>(`option[data-package-id="${CSS.escape(packageId)}"]`);
  if (option) select.value = option.value;
}

export function initInquiryForm() {
  const form = document.getElementById('inquiry-form') as HTMLFormElement | null;
  if (!form) return;

  const container = form.parentElement!;
  const success = container.querySelector<HTMLElement>('[data-form-success]')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = submit.querySelector<HTMLElement>('[data-submit-label]')!;
  const errorTemplate = document.getElementById('form-error-template') as HTMLTemplateElement;
  const packageSelect = form.querySelector<HTMLSelectElement>('#package')!;
  const dateInput = form.querySelector<HTMLInputElement>('#event_date')!;
  const controls = Array.from(form.querySelectorAll<Control>('input:not([type=hidden]):not([name=botcheck]), select, textarea'));
  const idleLabel = submitLabel.textContent ?? 'Send';

  form.noValidate = true; // we render our own accessible messages
  dateInput.min = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

  // "Inquire About This Package" buttons anywhere on the page preselect the package.
  document.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-package]');
    if (trigger) preselectPackage(packageSelect, trigger.dataset.package);
  });
  // Shareable links: djpazo.com/?package=signature-wedding#contact
  preselectPackage(packageSelect, new URLSearchParams(location.search).get('package'));

  // Validate a field once the visitor leaves it, then live while they fix it.
  controls.forEach((control) => {
    control.addEventListener('blur', () => control.value && showError(form, control));
    control.addEventListener('input', () => control.getAttribute('aria-invalid') === 'true' && showError(form, control));
    control.addEventListener('change', () => control.getAttribute('aria-invalid') === 'true' && showError(form, control));
  });

  let submitting = false;

  const setSubmitting = (value: boolean) => {
    submitting = value;
    submit.disabled = value;
    submit.setAttribute('aria-busy', String(value));
    submitLabel.textContent = value ? 'Sending…' : idleLabel;
  };

  const showFailure = () => {
    status.replaceChildren(errorTemplate.content.cloneNode(true));
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return; // guard against double submits

    const invalid = controls.filter((control) => !showError(form, control));
    if (invalid.length) {
      status.textContent = `Please fix ${invalid.length === 1 ? 'the highlighted field' : `the ${invalid.length} highlighted fields`}.`;
      invalid[0].focus();
      return;
    }

    status.textContent = '';
    setSubmitting(true);
    const timeout = new AbortController();
    const timer = window.setTimeout(() => timeout.abort(), SUBMIT_TIMEOUT_MS);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        signal: timeout.signal,
      });
      const result = (await response.json().catch(() => null)) as { success?: boolean } | null;

      if (!response.ok || result?.success !== true) throw new Error('Submission was not accepted');

      form.reset();
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch {
      showFailure();
    } finally {
      window.clearTimeout(timer);
      setSubmitting(false);
    }
  });

  container.querySelector('[data-form-reset]')?.addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    status.textContent = '';
    controls[0].focus();
  });
}
