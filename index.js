const BASE_URL = 'http://localhost:8000'
let mode = 'CREATE' //default mode
let selectId = ''
function toggleHamburgerIcon(el) { //เปลี่ยน icon จาก 3 เส้นเป็น X
    el.classList.toggle("change");
}

//ทำเชื่อมกดเข้าไปหา menu ใน icon ขีด 3 เส้น
const myMenu = document.getElementById('myMenu');
const hamIcon = document.getElementById('hamIcon');

hamIcon.addEventListener('click', function() { 
    if (myMenu.style.display === 'block') {
        myMenu.style.display = 'none';
    } else {
        myMenu.style.display = 'block';
    }
});

window.onload = async() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('book_id')
    console.log('book_id',id)
    if (id) {
        mode = 'EDIT'
        selectId = id

        //1. ดึงข้อมูล user ที่ต้องการ edit มาแสดง
        try {
            const response = await axios.get(`${BASE_URL}/users/${id}`)
            const book = response.data
        
        //2. เราจะนำข้อมูลของ user ที่ดึงมา ใส่ใน input ที่เรามี
        let TitleDom = document.querySelector('input[name=title]')
        let AuthorDom = document.querySelector('input[name=author]')
        let PublisherDom = document.querySelector('input[name=publisher]')
        let Publisher_YearDom = document.querySelector('input[name=publisher_year]')
        let ISBNDom = document.querySelector('input[name=isbn]')
        let Page_CountDom = document.querySelector('input[name=page_count]')
        
        TitleDom.value = book.title
        AuthorDom.value = book.author
        PublisherDom.value = book.publisher
        Publisher_YearDom.value = book.publisher_year
        ISBNDom.value = book.isbn
        Page_CountDom.value = book.page_count
        
        let CategoryDoms = document.querySelectorAll('input[name=category]')
        
        for (let i = 0; i < CategoryDoms.length; i++) {
            if (book.category.includes(CategoryDoms[i].value)) {
                CategoryDoms[i].checked = true
            }
        }
        }catch (error) {
            console.log('error',error)
        }
    }
}

const submitData = async () => {
    let TitleDom = document.querySelector('input[name=title]');
    let AuthorDom = document.querySelector('input[name=author]');
    let PublisherDom = document.querySelector('input[name=publisher]');
    let Publisher_YearDom = document.querySelector('input[name=publisher_year]');
    let CategoryDoms = document.querySelectorAll('input[name=category]:checked') || {}
    let ISBNDom = document.querySelector('input[name=isbn]');
    let Page_CountDom = document.querySelector('input[name=page_count]');

    let messageDOM = document.getElementById('message');
    
    try {
    let categorys = ''
    for (let i = 0; i < CategoryDoms.length; i++) {
        categorys += CategoryDoms[i].value;
        if (i != CategoryDoms.length - 1) {
            categorys += ', '
        }
    }

    let userData = {
        title: TitleDom.value,
        author: AuthorDom.value,
        publisher: PublisherDom.value,
        publisher_year: Publisher_YearDom.value,
        category: categorys,
        isbn: ISBNDom.value,
        page_count: Page_CountDom.value,
    }
    console.log('submitData',userData);
    
        let message = 'Save Book-information success'
        if (mode == 'CREATE') {
          const response = await axios.post(`${BASE_URL}/users`, userData)
          console.log('response',response.data)
        } else {
          const response = await axios.put(`${BASE_URL}/users/${selectId}`, userData)
          message = 'Edit Book-information success'
          console.log('response',response.data)
        }
        setTimeout(() => {
            window.location.href = 'user.html'
        }, 500);
        messageDOM.innerText = message
        messageDOM.className = 'message success'
    } catch (error) {
        console.log('error message',error.message)
        console.log('error',error.errors)
        
       if (error.response) {
            console.log('error',error.response.data.message)
            error.message = error.response.data.message
            error.errors = error.response.data.errors
       }
        
       let htmlData = '<div>'
       htmlData += `<div> ${error.message} <div>`
       htmlData += '<ul>'
       for (let i = 0; i < error.errors.length; i++) {
           htmlData += `<li> ${error.errors[i]} </li>`
       }
    
       htmlData += '</ul>'
       htmlData += '</div>'

       messageDOM.innerHTML = htmlData
       messageDOM.className = 'message danger'
    }
}
