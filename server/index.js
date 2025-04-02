
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

const port = 8000;

app.use(bodyParser.json());
app.use(cors());

let books = []

let conn = null
const initMySQL = async () => {
   conn = await mysql.createConnection({
    host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'webdb',
      port: 8820
     })
    }

    const validateData = (userData) => {
      let errors = []
      if (!userData.title) {
          errors.push('! Please Enter Title Name')
      }
      if (!userData.author) {
          errors.push('! Please Enter Author Name')
      }
      if (!userData.publisher) {
          errors.push('! Please Enter Publisher Name')
      }
      if (!userData.publisher_year) {
          errors.push('! Please Enter Publisher Year')
      }
      if (!userData.category) {
          errors.push('! Please Select Category of Books')
      }
      if (!userData.isbn) {
          errors.push('! Please Enter ISBN')
      }
      if(!userData.page_count){
        errors.push('! Please Enter Page Count')
      }
      return errors
   }

//path= GET /users ใช้สำหรับ get users ทั้งหมดที่บันทึกไว้
app.get('/users', async(req, res) => {
  const results = await conn.query('Select * FROM books')
      res.json(results[0])
})

// path= POST/users ใช้สำหรับสร้าง users ใหม่บันทึกเข้าไป
app.post('/users', async(req, res) => {
  try {
       let books = req.body;
       const errors = validateData(books)
       if(errors.length > 0) {
          throw { 
            message: 'Please fill all information completely', 
            errors: errors
          }
       }
       const results = await conn.query('INSERT INTO books SET ?', books)
       res.json({
        message: "Create Books-information successfully",
        data: results[0]
      })
  }catch(error){
    const errorMessages = error.message || 'Something went wrong'
    const errors = error.errors || []
        console.error('error message:', error.message)
        res.status(500).json({
          message: errorMessages,
          errors : errors
      })
    }
  })


//path= GET /users/:id สำหรับดึง users รายคนออกมา
app.get('/users/:id',async (req, res) => {
  try{
  let id = req.params.id;// ค้นหา  users หรือ index ที่ต้องการดึงข้อมูล
  const results = await conn.query('Select * FROM books WHERE book_id = ?', id)
     if (results[0].length == 0) {
        throw {statusCode: 404, message: 'User not found'}
      }
         res.json(results[0][0])

  }catch(error){
    console.error('error:', error.message)
      let statusCode = error.status || 500
      res.status(500).json({
      message: "Something went wrong",
      error: error.message
    })
   }
});


//path: PUT /users/:id ใช้สำหรับแก้ไขข้อมูล user ที่มี id เป็นตัวเเปร
app.put('/users/:id',async (req, res) => {
  // หา users จาก id ที่ส่งมา
   try {
     let id = req.params.id;
     let updateUser = req.body;
     const results = await conn.query(
      'UPDATE books SET ? WHERE book_id = ?', 
      [updateUser, id]
      )
     res.json({
      message: "Update Book-information successfully",
      data: results[0]
      })
   }catch(error){
     console.error('error:', error.message)
     res.status(500).json({
       message: "Something went wrong",
       error: error.message
     })
   }
}) // users ที่ upadate ใหม่ update กลับไปเก็บใน users เดิม
 

//path: DELETE /users/:id ใช้สำหรับลบข้อมูล user ที่มี id เป็นตัวเเปร
// หา index ของ user ที่ต้องการลบ
// ลบ
app.delete('/users/:id',async (req, res) => {
  try{
  let id = req.params.id;
     const results = await conn.query('DELETE from books WHERE book_id = ?',id)
     res.json({
      message: "Delete Book-information successfully",
      data: results[0]
      })
   }catch(error){
     console.error('error:', error.message)
     res.status(500).json({
       message: "Something went wrong",
       error: error.message
     })
   }
})
  app.listen(port,async (req,res) => {
    await initMySQL()
    console.log('http server is running on port' + port);
  });
 
