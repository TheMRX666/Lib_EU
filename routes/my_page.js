var express = require('express');
var router = express.Router();

router.get('/my-page', (req, res) => {
    res.render('my_page', { title: 'Тут кнопочки', items: ['Кнопка 1', 'Це теж кнопка)', 'І це кнопка'] });
  });

module.exports = router;