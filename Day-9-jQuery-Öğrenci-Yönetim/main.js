        let studentData = [
            {
                id: 1,
                name: "Ercüment Kınalı",
                class: "12-B",
                age: 18,
                email: "ercumentkinali@gmail.com"
            },
            {
                id: 2,
                name: "Ela Ünver",
                class: "11-B",
                age: 17,
                email: "ela.ünver@gmail.com"
            },
            {
                id: 3,
                name: "Eda Ünver",
                class: "9-A",
                age: 15,
                email: "eda.ünver@gmail.com"
            },
            {
                id: 4,
                name: "Oğuzhan Ergin",
                class: "12-A",
                age: 18,
                email: "oguzhan.ergin@gmail.com"
            },
            {
                id: 5,
                name: "Yetkin Tunay",
                class: "10-B",
                age: 16,
                email: "yetkin.tunay@gmail.com"
            }
        ];

        let nextId = 6;

        $(document).ready(function() {
            displayStudents();
            updateStats();

            $('#studentForm').submit(function(e) {
                e.preventDefault();
                console.log('Form gönderildi'); 
                addStudent();
                return false;
            });

            $(document).on('click', '#studentForm button[type="submit"]', function(e) {
                e.preventDefault();
                console.log('Submit butonu tıklandı'); 
                addStudent();
                return false;
            });

            $(document).on('click', '#studentTableBody tr', function(e) {
                if ($(e.target).hasClass('delete-btn') || $(e.target).closest('.delete-btn').length > 0) {
                    return;
                }
                $('#studentTableBody tr').removeClass('highlighted');
                $(this).addClass('highlighted');
            });

            $(document).on('click', '.delete-btn', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Silme butonu tıklandı'); 
                const studentId = parseInt($(this).attr('data-id'));
                console.log('Silinecek ID:', studentId); 
                deleteStudent(studentId);
                return false;
            });
        });

        function addStudent() {
            console.log('addStudent fonksiyonu çağrıldı'); 
            
            const name = $('#studentName').val().trim();
            const studentClass = $('#studentClass').val();
            const age = parseInt($('#studentAge').val());
            const email = $('#studentEmail').val().trim();

            console.log('Form verileri:', { name, studentClass, age, email }); 

            if (!name) {
                alert('Öğrenci adı boş olamaz!');
                return;
            }
            if (!studentClass) {
                alert('Sınıf seçimi yapınız!');
                return;
            }
            if (!age || age < 14 || age > 25) {
                alert('Geçerli bir yaş giriniz (14-25)!');
                return;
            }
            if (!email) {
                alert('E-mail adresi boş olamaz!');
                return;
            }

            const newStudent = {
                id: nextId++,
                name: name,
                class: studentClass,
                age: age,
                email: email
            };

            console.log('Yeni öğrenci:', newStudent); 

            studentData.push(newStudent);

            $('#studentForm')[0].reset();

            displayStudents();
            updateStats();

            alert('Öğrenci başarıyla eklendi!');
            
            console.log('Güncel öğrenci listesi:', studentData); 
        }

        function deleteStudent(id) {
            console.log('deleteStudent fonksiyonu çağrıldı, ID:', id); 
            
            if (!id) {
                alert('Geçersiz öğrenci ID!');
                return;
            }

            const studentToDelete = studentData.find(student => student.id === id);
            if (!studentToDelete) {
                alert('Öğrenci bulunamadı!');
                return;
            }
            
            if (confirm(`"${studentToDelete.name}" adlı öğrenciyi silmek istediğinizden emin misiniz?`)) {
                const initialLength = studentData.length;
                studentData = studentData.filter(student => student.id !== id);
                
                console.log('Silme öncesi:', initialLength, 'Silme sonrası:', studentData.length); 
                
                displayStudents();
                updateStats();
                
                alert('Öğrenci başarıyla silindi!');
            }
        }

        function displayStudents() {
            const tableBody = $('#studentTableBody');
            tableBody.empty();

            if (studentData.length === 0) {
                tableBody.append(`
                    <tr>
                        <td colspan="6" class="no-students">
                            📝 Henüz öğrenci kaydı bulunmuyor.
                        </td>
                    </tr>
                `);
                return;
            }

            studentData.forEach(student => {
                const row = `
                    <tr data-id="${student.id}">
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        <td>${student.class}</td>
                        <td>${student.age}</td>
                        <td>${student.email}</td>
                        <td>
                            <button class="btn btn-danger delete-btn" data-id="${student.id}">
                                🗑️ Sil
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.append(row);
            });
        }

        function updateStats() {
            const totalStudents = studentData.length;
            const uniqueClasses = [...new Set(studentData.map(student => student.class))].length;
            
            $('#totalStudents').text(totalStudents);
            $('#totalClasses').text(uniqueClasses);
        }

        $(document).ready(function() {
            $('input, select').on('focus', function() {
                $(this).parent().addClass('focused');
            }).on('blur', function() {
                $(this).parent().removeClass('focused');
            });

            $(document).on('dblclick', '#studentTableBody tr', function() {
                const studentId = $(this).data('id');
                const student = studentData.find(s => s.id === studentId);
                if (student) {
                    alert(`Öğrenci Detayları:\n\nAdı: ${student.name}\nSınıf: ${student.class}\nYaş: ${student.age}\nE-mail: ${student.email}`);
                }
            });
        });