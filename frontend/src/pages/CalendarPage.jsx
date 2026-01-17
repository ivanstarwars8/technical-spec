import { useState, useEffect } from 'react';
import { lessonsAPI, studentsAPI } from '../services/api';
import Calendar from '../components/Calendar';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';

const CalendarPage = () => {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [formData, setFormData] = useState({
    student_id: '',
    datetime_start: '',
    datetime_end: '',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const now = new Date();
      const start = startOfWeek(now, { locale: ru, weekStartsOn: 1 });
      const end = endOfWeek(now, { locale: ru, weekStartsOn: 1 });

      const [lessonsRes, studentsRes] = await Promise.all([
        lessonsAPI.getCalendar({
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd'),
        }),
        studentsAPI.getAll(),
      ]);

      setLessons(lessonsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedLesson(null);
    setFormData({
      student_id: '',
      datetime_start: format(date, "yyyy-MM-dd'T'10:00"),
      datetime_end: format(date, "yyyy-MM-dd'T'11:00"),
      amount: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setFormData({
      student_id: lesson.student_id,
      datetime_start: format(new Date(lesson.datetime_start), "yyyy-MM-dd'T'HH:mm"),
      datetime_end: format(new Date(lesson.datetime_end), "yyyy-MM-dd'T'HH:mm"),
      amount: lesson.amount || '',
      notes: lesson.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLesson) {
        await lessonsAPI.update(selectedLesson.id, formData);
      } else {
        await lessonsAPI.create(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      alert('Ошибка сохранения: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить занятие?')) return;

    try {
      await lessonsAPI.delete(selectedLesson.id);
      setShowModal(false);
      loadData();
    } catch (error) {
      alert('Ошибка удаления: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Календарь</h1>
        <p className="text-gray-600">Планирование занятий</p>
      </div>

      <Calendar
        lessons={lessons}
        onDayClick={handleDayClick}
        onLessonClick={handleLessonClick}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">
              {selectedLesson ? 'Редактировать занятие' : 'Новое занятие'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Ученик *</label>
                <select
                  className="input"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                >
                  <option value="">Выберите ученика</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Начало *</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.datetime_start}
                    onChange={(e) => setFormData({ ...formData, datetime_start: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Конец *</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.datetime_end}
                    onChange={(e) => setFormData({ ...formData, datetime_end: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Стоимость (₽)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="label">Заметки</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Дополнительная информация..."
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {selectedLesson ? 'Сохранить' : 'Создать'}
                </button>
                {selectedLesson && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-danger"
                  >
                    Удалить
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
