import { useState } from "react";
import "./FeedbackForm.css";

const initialFormData = {
  name: "",
  email: "",
  message: "",
  phone: "",
  wantReply: false,
};

// Форматирование номера телефона в маску +7 (XXX) XXX-XX-XX
function formatPhone(value) {
  // Удаляем всё, кроме цифр
  const digits = value.replace(/\D/g, "");

  // Если первая цифра 7 или 8, убираем её (будем добавлять +7 сами)
  let clean = digits;
  if (digits.startsWith("7") || digits.startsWith("8")) {
    clean = digits.slice(1);
  }

  // Ограничиваем 10 цифрами (код + номер)
  clean = clean.slice(0, 10);

  // Форматируем
  let formatted = "+7";
  if (clean.length > 0) {
    formatted += " (" + clean.slice(0, 3);
  }
  if (clean.length > 3) {
    formatted += ") " + clean.slice(3, 6);
  }
  if (clean.length > 6) {
    formatted += "-" + clean.slice(6, 8);
  }
  if (clean.length > 8) {
    formatted += "-" + clean.slice(8, 10);
  }

  return formatted;
}

function validate(formData) {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Имя обязательно для заполнения";
  }

  // Email: обязателен только если wantReply === true
  if (formData.wantReply) {
    if (!formData.email.trim()) {
      errors.email = "Email обязателен для получения ответа";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Введите корректный email";
    }
  } else {
    // Если не хотим ответа, email не обязателен, но если заполнен — проверяем формат
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Введите корректный email";
    }
  }

  if (!formData.message.trim()) {
    errors.message = "Сообщение обязательно для заполнения";
  }

  // Валидация телефона: если поле непустое, проверяем полноту маски
  if (formData.phone.trim()) {
    const digits = formData.phone.replace(/\D/g, "").slice(1); // убираем +7
    if (digits.length < 10) {
      errors.phone = "Введите полный номер телефона";
    }
  }

  return errors;
}

export default function FeedbackForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
    const { name, type, checked } = e.target;
    let value = e.target.value;

    // Для checkbox берём checked, для телефона — форматируем
    if (type === "checkbox") {
      value = checked;
    } else if (name === "phone") {
      value = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // При изменении wantReply сбрасываем ошибки email
    if (name === "wantReply") {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }

    // Валидация при изменении, если поле уже тронуто
    if (touched[name]) {
      const newData = { ...formData, [name]: value };
      const newErrors = validate(newData);
      setErrors((prev) => ({
        ...prev,
        [name]: newErrors[name] || undefined,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const newErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: newErrors[name] || undefined,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate(formData);
    setErrors(newErrors);

        // Отмечаем все поля как тронутые (включая телефон)
    setTouched({
      name: true,
      email: true,
      message: true,
      phone: true,
    });

    // Если ошибок нет — показываем экран успеха
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
    }
  };

  // Возвращает строку классов для инпута в зависимости от состояния
  const getInputClass = (field) => {
    const classes = ["field__input"];

    // Если поле тронуто и есть ошибка — добавляем класс ошибки
    if (touched[field] && errors[field]) {
      classes.push("field__input--error");
    }
    // Если поле тронуто и ошибки нет — добавляем класс успеха
    else if (touched[field] && !errors[field]) {
      classes.push("field__input--valid");
    }

    // Для textarea добавляем отдельный класс
    if (field === "message") {
      classes.push("field__input--textarea");
    }

    return classes.join(" ");
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <form className="feedback-form feedback-form--success">
        <h2 className="feedback-form__title">Спасибо за обратную связь!</h2>
        <p className="feedback-form__text">
          Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее
          время.
        </p>
        <button
          type="button"
          className="feedback-form__submit"
          onClick={handleReset}
        >
          Отправить ещё раз
        </button>
      </form>
    );
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate>
      {/* Поле Имя */}
      <div className="field">
        <label className="field__label" htmlFor="name">
          Имя
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={getInputClass("name")}
          placeholder="Введите ваше имя"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.name && errors.name && (
          <span className="field__error">{errors.name}</span>
        )}
      </div>

      {/* Поле Email */}
      <div className="field">
        <label className="field__label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={getInputClass("email")}
          placeholder="Введите ваш email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.email && errors.email && (
          <span className="field__error">{errors.email}</span>
        )}
      </div>

      {/* Поле Телефон (Задание 2) */}
      <div className="field">
        <label className="field__label" htmlFor="phone">
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={getInputClass("phone")}
          placeholder="+7 (___) ___-__-__"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.phone && errors.phone && (
          <span className="field__error">{errors.phone}</span>
        )}
      </div>

      {/* Поле Сообщение */}
      <div className="field">
        <label className="field__label" htmlFor="message">
          Сообщение
        </label>
        <textarea
          id="message"
          name="message"
          className={getInputClass("message")}
          placeholder="Введите ваше сообщение"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.message && errors.message && (
          <span className="field__error">{errors.message}</span>
        )}
      </div>

            {/* Checkbox «Хочу получить ответ» (Задание 3) */}
      <div className="field field--checkbox">
        <label className="field__checkbox-label">
          <input
            name="wantReply"
            type="checkbox"
            checked={formData.wantReply}
            onChange={handleChange}
            className="field__checkbox"
          />
          <span>Хочу получить ответ</span>
        </label>
      </div>

      {/* Кнопка отправки */}
      <button
        type="submit"
        className="feedback-form__submit"
        disabled={Object.keys(touched).length > 0 && Object.keys(errors).length > 0}
      >
        Отправить
      </button>
    </form>
  );
}