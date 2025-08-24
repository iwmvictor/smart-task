# Smart Task

Smart Task is a web-based task management application designed to help users organize, prioritize, and manage their tasks efficiently. It features task creation, editing, deletion, priority management, due dates, and a rich-text editor for detailed descriptions.

## Features

- **Task Management**: Add, edit, delete, and view tasks.
- **Priority Levels**: Assign High, Medium, or Low priority to tasks.
- **Due Dates & Times**: Set deadlines for each task.
- **Rich Text Editor**: Use a WYSIWYG editor for task descriptions.
- **Dark Mode**: Toggle between light and dark themes.
- **Task Filtering**: Filter tasks by All, Completed, or Pending.

## Technologies Used

- **HTML5**: Markup structure.
- **CSS3**: Styling and layout.
- **JavaScript**: Application logic and interactivity.
- **FontAwesome**: Iconography.
- **Quill.js**: Rich-text editing for task descriptions.

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari).
- Local server (optional, for advanced features).

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/iwmvictor/smart-task.git
   cd smart-task
   ```

2. **Open the app:**

   - Open `index.html` in your preferred web browser.

3. **Try the hosted version:**
   - Visit [https://iwmvictor.github.io/smart-task/](https://iwmvictor.github.io/smart-task/) for the live demo.

## Usage

- The main interface displays the current time and your task list.
- Use the **plus (+) button** to add a new task.
- Filter tasks by All, Completed, or Pending using the filter options.
- Click on a task to view details, edit, or delete it.
- Use the rich-text editor in the task form for detailed descriptions.
- Toggle dark mode for a different visual experience.

### Modals

- **Task Form Modal**: Add or edit tasks with title, priority, due date/time, and description.
- **Task Detail Modal**: View task details, edit, or delete the task.
- **Delete Confirmation Modal**: Confirms before deleting a task.

## Screenshots

> _Landing Screen UI preview._

![Landing Screen](/assets/screenshots/screen1.png)

> _Landing Screen UI on Darkmode preview._

![Task Form Modal](/assets/screenshots/dark.png)

> _Creating new task._

![Task Detail Modal](/assets/screenshots/new.png)

> _View Task details/info._

![Dark Mode](/assets/screenshots/preview.png)

> _Confirm delete modal._

![Dark Mode](/assets/screenshots/delete.png)

## Known Issues

- Tasks are being stored on localstorage since no backend integrated.
- Date formatting may vary across locales.

## Future Enhancements

- Add backend/database support for persistent storage.
- Improve UI/UX with animations and transitions.
- Implement user authentication for multi-user support.

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Make your changes.
4. Commit your changes:
   ```bash
   git commit -am 'Add new feature'
   ```
5. Push to your branch:
   ```bash
   git push origin feature/your-feature
   ```
6. Create a pull request.

## License

This project is open-source and available under the [MIT License](LICENSE).

## Developer

> Proudly developed by [Iwmvictor](https:dribbble.com/iwmvictor) &copy; 2025
