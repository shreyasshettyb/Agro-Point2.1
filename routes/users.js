const express = require("express");
const fileUpload = require('express-fileupload');
const router = express.Router();
const bcrypt = require("bcryptjs");
const mySqlConnection = require("../config/db");


router.get("/register", (req, res) => {
  if (!req.session.user) {
    res.statusCode = 200
    res.render("register")
  } else {
    res.status = 401;
    res.redirect("/dashboard?logout+first");
  }
});


router.post("/register", (req, res) => {
  const {
    fname,
    lname,
    email,
    mobile,
    password,
    password2
  } = req.body;
  let errors = [];
  if (password != password2) {
    errors.push({
      msg: "Passwords do not match"
    })
  }
  if (password.length < 6) {
    errors.push({
      msg: "Password must be at least 6 characters"
    })
  }
  mySqlConnection.query(
    "SELECT * FROM customers WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) {
        res.status = 500;
        res.send(err);
      }
      if (rows.length)
        errors.push({
          msg: "Email already exists"
        })
      if (errors.length > 0) {
        res.render('register', {
          errors,
          fname,
          lname,
          email,
          mobile
        })
      } else {
        pwdHash = bcrypt.hashSync(password, 10);
        var sql = `INSERT INTO customers (first_name, last_name,email,mobile_number, password) VALUES ?`
        var values = [
          [fname, lname, email, mobile, pwdHash]
        ];
        mySqlConnection.query(sql, [values], err => {
          if (err) {
            res.status = 500;
            res.send(err);
          }
        })
        res.render("login", {
          msg: "Registered successfully"
        })
      }
    },
  )
});


router.get("/login", (req, res) => {
  if (!req.session.user) {
    res.statusCode = 200
    res.render("login", {error: []})
  } else {
    res.status = 401
    res.redirect("/dashboard?logout+first")
  }
});

router.post("/login", (req, res) => {
  const {
    email,
    password
  } = req.body
  mySqlConnection.query(
    "SELECT * FROM customers WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) res.status(500).send(err);
      customer = rows[0];
      if (customer) {
        const result = bcrypt.compareSync(password, customer.password);
        if (result) {
          req.session.user = customer;
          res.redirect(`dashboard/${customer.customer_id}`);
        } else {
          res.render('login');
        }
      } else {
        res.render('login', {
          error: "This EmailId does not exists"
        });
      }
    },
  )
});


// fetch dashboard coressponding to given user
router.get("/dashboard/:id", (req, res) => {
  if (req.session.user) {
    let sql = `SELECT * FROM 
    hotels JOIN hotels_location
    using(hotel_id)  
    JOIN  hotels_contact
    using(hotel_id)
    JOIN hotel_images
    using(hotel_id)
    JOIN rooms using(hotel_id)
    JOIN rooms_category
    using(room_category_id)
    WHERE rooms.unit_price = (SELECT MIN(unit_price) FROM  rooms where hotel_id = hotels.hotel_id)
    ORDER BY rating DESC;`;
    mySqlConnection.query(sql, (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        mySqlConnection.query(
          "SELECT * FROM customers WHERE customer_id = ?", [req.params.id],
          (err, result) => {
            if (err)
              res.status(500).send(err);
            else {
              customer = result[0];
              res.render('dashboard', {
                customer,
                rows: rows
              });
            }
          });
      }
    });
  } else {
    res.status(401);
    res.redirect('/users/login?login+first');
  }
});


router.get("/dashboard/:id/sort_price_asc", (req, res) => {
  if (req.session.user) {
    let sql = `SELECT * FROM 
    hotels JOIN hotels_location
    using(hotel_id)  
    JOIN  hotels_contact
    using(hotel_id)
    JOIN hotel_images
    using(hotel_id)
    JOIN rooms using(hotel_id)
    JOIN rooms_category
    using(room_category_id)
    WHERE rooms.unit_price = (SELECT MIN(unit_price) FROM  rooms where hotel_id = hotels.hotel_id)
    ORDER BY rooms.unit_price`;
    mySqlConnection.query(sql, (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        mySqlConnection.query(
          "SELECT * FROM customers WHERE customer_id = ?", [req.params.id],
          (err, result) => {
            if (err)
              res.status(500).send(err);
            else {
              customer = result[0];
              res.render('dashboard', {
                customer,
                rows: rows
              });
            }
          });
      }
    });
  } else {
    res.status(401);
    res.redirect('/users/login?login+first');
  }
});


router.get("/dashboard/:id/sort_price_dsc", (req, res) => {
  if (req.session.user) {
    let sql = `SELECT * FROM 
    hotels JOIN hotels_location
    using(hotel_id)  
    JOIN  hotels_contact
    using(hotel_id)
    JOIN hotel_images
    using(hotel_id)
    JOIN rooms using(hotel_id)
    JOIN rooms_category
    using(room_category_id)
    WHERE rooms.unit_price = (SELECT MIN(unit_price) FROM  rooms where hotel_id = hotels.hotel_id)
    ORDER BY rooms.unit_price DESC`;
    mySqlConnection.query(sql, (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        mySqlConnection.query(
          "SELECT * FROM customers WHERE customer_id = ?", [req.params.id],
          (err, result) => {
            if (err)
              res.status(500).send(err);
            else {
              customer = result[0];
              res.render('dashboard', {
                customer,
                rows: rows
              });
            }
          });
      }
    });
  } else {
    res.status(401);
    res.redirect('/users/login?login+first');
  }
});


router.get("/profile/:id", (req, res) => {
  if (req.session.user) {
    mySqlConnection.query(
      "SELECT * FROM customers WHERE customer_id = ?", [req.params.id],
      (err, result) => {
        if (err)
          res.status(500).send(err);
        else {
          customer = result[0];
          mySqlConnection.query(
            `SELECT *,rooms.unit_price*booking_items.quantity AS price
                                 FROM booking_items
                                 JOIN bookings using(booking_id)
                                 JOIN hotels using(hotel_id)
                                 JOIN rooms_category using(room_category_id)
                                 JOIN rooms ON rooms.hotel_id = hotels.hotel_id AND rooms.room_category_id = rooms_category.room_category_id
                                 JOIN customers using(customer_id)
                                 WHERE customer_id = ?`,
            [req.params.id],
            (err, rows) => {
              if (err) {
                res.status(500).send(err);
              } else {
                let bookings = rows;
                res.render('profile', {
                  customer,
                  bookings: bookings
                });
              }
            });
        }
      });
  } else {
    res.status(400);
    res.redirect('/users/login?login+first');
  }
});

// fetch hotel page
router.get('/hotel/:id1/:id2', (req, res) => {
  if (req.session.user) {
    mySqlConnection.query(
      `SELECT * FROM hotels
      JOIN hotels_contact
      using(hotel_id)
      JOIN hotels_location 
      using(hotel_id)
      JOIN hotel_images
      using(hotel_id)
      JOIN rooms 
      using(hotel_id)
      JOIN rooms_category
      using(room_category_id)
      WHERE hotels.hotel_id = ?`,
      [parseInt(req.params.id1)],
      (err, rows) => {
        if (err) {
          res.status(500).send(err);
        } else {
          mySqlConnection.query(
            `SELECT * FROM customers 
              WHERE customer_id = ?`,
            [req.params.id2],
            (err, result) => {
              if (err) {
                res.status(500).send(err);
              } else {
                customer = result[0];
                res.render('hotelpage', {
                  customer,
                  rows: rows
                });
              }
            });
        }
      });
  } else {
    res.redirect('/users/login?login+first');
  }
});


// post request on hotels page
router.post('/hotel/:id1/:id2', (req, res) => {
  if (req.session.user) {
    const {
      room_category,
      quantity,
      start_date,
      end_date
    } = req.body;
    let errors1 = [];
    if (end_date <= start_date)
      errors1.push({
        msg: 'Please enter valid dates'
      });
    mySqlConnection.query(
      `SELECT * FROM rooms JOIN rooms_category using(room_category_id) WHERE rooms.hotel_id = ? AND rooms_category.category_name = '${room_category}'`,
      [parseInt(req.params.id1)],
      (err, result) => {
        if (err) {
          res.status(500).send(err);
        } else {
          if (result[0].available_quantity < quantity) {
            errors1.push({
              msg: 'Please enter valid number of rooms'
            });
          }
          if (errors1.length > 0) {
            mySqlConnection.query(
              `SELECT * FROM hotels
              JOIN hotels_contact
              using(hotel_id)
              JOIN hotels_location 
              using(hotel_id)
              JOIN hotel_images
              using(hotel_id)
              JOIN rooms 
              using(hotel_id)
              JOIN rooms_category
              using(room_category_id)
              WHERE hotels.hotel_id = ?`,
              [parseInt(req.params.id1)],
              (err, rows) => {
                if (err) {
                  res.status(500).send(err);
                } else {
                  mySqlConnection.query(
                    `SELECT * FROM customers 
                      WHERE customer_id = ?`,
                    [req.params.id2],
                    (err, result) => {
                      if (err) {
                        res.status(500).send(err);
                      } else {
                        customer = result[0];
                        res.render('hotelpage', {
                          customer,
                          rows: rows,
                          errors1
                        });
                      }
                    });
                }
              });
          } else {
            var query = `INSERT INTO bookings(hotel_id,customer_id,start_time,end_time) VALUES ?`;
            var values = [
              [req.params.id1, req.params.id2, start_date, end_date]
            ];
            mySqlConnection.query(query, [values], (err) => {
              if (err) {
                res.status(500).send(err);
              } else {
                mySqlConnection.query('SELECT LAST_INSERT_ID() AS last', (err, last) => {
                  if (err)
                    res.status(500).send(err);
                  else {
                    var last_id = parseInt(last[0].last);
                    mySqlConnection.query(`SELECT * FROM rooms_category WHERE  category_name = ?`,
                      [room_category], (err, result1) => {
                        if (err) {
                          res.status(500).send(err);
                        } else {
                          var category_id = parseInt(result1[0].room_category_id);
                          var query = `INSERT INTO booking_items(booking_id, room_category_id, quantity) VALUES ?`;
                          var values = [
                            [last_id, category_id, quantity]
                          ];
                          mySqlConnection.query(query, [values], (err) => {
                            if (err) {
                              res.status(500).send(err);
                            } else {
                              var query =
                                `SELECT *,rooms.unit_price*booking_items.quantity AS price
                              FROM booking_items
                              JOIN bookings using(booking_id)
                              JOIN hotels using(hotel_id)
                              JOIN rooms_category using(room_category_id)
                              JOIN rooms ON rooms.hotel_id = hotels.hotel_id AND rooms.room_category_id = rooms_category.room_category_id
                              JOIN customers using(customer_id)
                              WHERE booking_id = ?`;
                              mySqlConnection.query(query, [last_id], (err, result2) => {
                                if (err) {
                                  res.status(500).send(err);
                                } else {
                                  res.render('success', {
                                    rows: result2[0]
                                  });
                                  mySqlConnection.query(`UPDATE rooms SET available_quantity = available_quantity - ? WHERE (hotel_id = ${req.params.id1} AND room_category_id = ?)`, [quantity, category_id], (err) => {
                                    if (err) {
                                      res.status(500).send(err);
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                  }
                });
              }
            });
          }
        }
      });
  } else {
    res.redirect('/users/login?login+first');
  }
});

// logout 
router.get("/logout", (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(() => {
      res.status = 200;
      res.redirect('register?logout+success');
    })
  } else {
    res.status(400);
    res.redirect('/users/login');
  }
});

router.get("/hotelDelete/:id1/:id2", (req, res) => {
  if (req.session.user) {
    mySqlConnection.query(
      "SELECT * FROM customers WHERE customer_id = ?", [req.params.id2],
      (err, result) => {
        if (err)
          res.status(500).send(err);
        else {
          customer = result[0];
          mySqlConnection.query(
            `delete from bookings WHERE customer_id = ? and hotel_id = ?`,
            [req.params.id2, req.params.id1],
            (err, rows) => {
              if (err) {
                res.status(500).send(err);
              } else {
                res.status(200).json({success : true})
              }
            });
        }
      });
  } else {
    res.status(400);
    res.redirect('/users/login?login+first');
  }
});

module.exports = router;