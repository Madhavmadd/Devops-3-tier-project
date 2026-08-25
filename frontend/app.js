//const API_URL = "http://10.0.139.2:5000";
const API_URL = "";

const courseList = document.getElementById("courseList");
const courseSelect = document.getElementById("course");
const registrationForm =
    document.getElementById("registrationForm");

async function loadCourses() {

    const response =
        await fetch(`${API_URL}/api/courses`);

    const courses = await response.json();

    courses.forEach(course => {

        const card = document.createElement("div");

        card.className = "course-card";

        card.innerHTML = `
            <h3>${course.name}</h3>

            <p>
                ${course.description}
            </p>

            <h4>₹${course.price}</h4>

            <button onclick="selectCourse('${course.name}')">
                Register
            </button>
        `;

        courseList.appendChild(card);

        const option =
            document.createElement("option");

        option.value = course.name;
        option.textContent = course.name;

        courseSelect.appendChild(option);
    });
}

function selectCourse(courseName) {

    courseSelect.value = courseName;

    document
        .getElementById("register")
        .scrollIntoView();
}

registrationForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const student = {

            name:
                document.getElementById("name").value,

            email:
                document.getElementById("email").value,

            phone:
                document.getElementById("phone").value,

            course:
                document.getElementById("course").value
        };

        const response = await fetch(
            `${API_URL}/api/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(student)
            }
        );

        const result = await response.json();

        document.getElementById("message")
            .textContent = result.message;

        registrationForm.reset();

        loadStudents();
    }
);

async function loadStudents() {

    const response =
        await fetch(`${API_URL}/api/students`);

    const students = await response.json();

    const studentList =
        document.getElementById("studentList");

    studentList.innerHTML = "";

    students.forEach(student => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
        `;

        studentList.appendChild(row);
    });
}

loadCourses();
loadStudents();
