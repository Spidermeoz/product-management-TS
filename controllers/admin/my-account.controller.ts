import { Request, Response, RequestHandler } from "express";
import { systemConfig } from "../../config/config";
import Account from "../../models/account.model";
import md5 from "md5";
import { Status } from "cloudinary";

interface AccountFind {
  deleted: boolean;
  _id?: string | Record<string, unknown>;
  email?: string;
  createdBy?: {
    account_id: string;
    createdAt?: Date;
  };
  $or?: unknown[];
  [key: string]: unknown;
}

interface EditParams {
  id: string;
}

interface EditBody {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  avatar?: string;
  status?: Status;
}

// [GET] /admin/my-account
export const index = async (req: Request, res: Response): Promise<void> => {
  // Render
  res.render("admin/pages/my-account/index", {
    pageTitle: "Thông tin cá nhân",
  });
};

// [GET] /admin/my-account/edit
export const edit = async (req: Request, res: Response): Promise<void> => {
  res.render("admin/pages/my-account/edit", {
    pageTitle: "Chỉnh sửa thông tin cá nhân",
  });
};

// [PATCH] /admin/my-account/edit
export const editPatch: RequestHandler<EditParams, any, EditBody> = async (
  req,
  res
) => {
  const id = res.locals.authUser._id;
  console.log("[editPatch] id:", id);
  const referer =
    req.get("referer") || `/${systemConfig.prefixAdmin}/my-account`;

  try {
    const update: Record<string, unknown> = {};

    const findEmail: AccountFind = {
      _id: { $ne: id }, //ne = not equal
      email: req.body.email,
      deleted: false,
    };

    const emailExist = await Account.findOne(findEmail);

    if (emailExist) {
      req.flash("error", "Email đã tồn tại, vui lòng dùng email khác!");
    } else {
      if (req.body.fullName) update.fullName = req.body.fullName;
      if (req.body.email) update.email = req.body.email;
      if (req.body.password) {
        update.password = md5(req.body.password);
      } else {
        delete req.body.password;
      }

      if (req.body.status === "active" || req.body.status === "inactive") {
        update.status = req.body.status;
      }

      const cloudThumb =
        typeof req.body.avatar === "string" && req.body.avatar.trim()
          ? req.body.avatar.trim()
          : "";

      if (cloudThumb) {
        update.avatar = cloudThumb; // <-- cập nhật link Cloudinary nếu có file mới
      }

      const updatedBy = {
        account_id: res.locals.authUser._id,
        updatedAt: new Date(),
      };

      await Account.updateOne(
        { _id: id },
        {
          $set: update,
          $push: {
            updatedBy: updatedBy,
          },
        }
      );

      req.flash?.("success", "Cập nhật thông tin thành công!");
    }
  } catch (error) {
    console.error("[editPatch] error:", error);
    req.flash?.("error", "Cập nhật thông tin thất bại!");
  }

  res.redirect(referer);
};
