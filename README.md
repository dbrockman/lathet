# lathet

Create lazy functions that can depend on other lazy functions

```js
import createLazyTask from 'lathet';

export function sendForgotPasswordEmail(user_id) {
  const get_user_task = createLazyTask(user_id, getUser);
  const create_token_task = createLazyTask(createResetToken);
  const save_token_task = createLazyTask(get_user_task, create_token_task, saveResetToken);
  const send_email_task = createLazyTask(get_user_task, create_token_task, sendResetPasswordEmail);
  return send_email_task();
}

function getUser(user_id) {
  return Promise.resolve('👩');
}

function createResetToken() {
  return Promise.resolve('🔑');
}

function saveResetToken(user, token) {
  return Promise.resolve('👍');
}

function sendResetPasswordEmail(user, token) {
  return Promise.resolve('📬');
}
```
