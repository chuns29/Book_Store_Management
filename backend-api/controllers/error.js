exports.get404 = (req, res, next) => {
  // Trả về JSON thay vì render trang HTML 404
  res.status(404).json({ message: 'Page Not Found', path: req.url });
};