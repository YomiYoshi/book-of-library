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