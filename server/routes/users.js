const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const { json } = require("express");

router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Аккаунт обновлен");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Вы можете обновить только ваш аккаунт");
  }
});
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Аккаунт удален");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Вы можете удалить только свой аккаунт");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("Вы успешно подписались");
      } else {
        res.status(403).json("Вы уже подписаны на этого пользователя");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Вы не можете подписаться на себя");
  }
});

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("Вы успешно отписались");
      } else {
        res.status(403).json("Вы не можете подписаться на этого пользователя");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Вы не можете отписаться от себя");
  }
});

module.exports = router;
