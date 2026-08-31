import { Resend } from "resend";
import { env } from "#/env";

const resend = new Resend(env.RESEND_API_KEY);
const serverName = "跨界简历";
const companyName = "北京明日创界科技有限公司";
const serverDomain = "huiwang.fun";

export async function sendPasswordResetEmail({
  to,
  subject,
  url,
}: {
  to: string;
  subject: string;
  url: string;
}) {
  const from = `${serverName} <no-reply@${serverDomain}>`;

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text: [
      `${serverName} 密码重置`,
      "",
      "请通过以下链接重置密码：",
      url,
      "",
      companyName
        ? `本邮件由 ${serverName} 发送，运营主体为 ${companyName}。`
        : `本邮件由 ${serverName} 发送。`,
    ].join("\n"),
    html: `
      <div style="margin:0;padding:0;background-color:#f6f9fc;font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;">
        <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
          <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:40px 32px;box-sizing:border-box;">
            <div style="font-size:24px;line-height:32px;font-weight:700;color:#111827;margin-bottom:16px;">
              ${serverName} 密码重置
            </div>
            <div style="font-size:15px;line-height:24px;color:#4b5563;margin-bottom:12px;">
              我们收到了你的密码重置请求。点击下面的按钮即可设置新密码。
            </div>
            <div style="font-size:15px;line-height:24px;color:#4b5563;margin-bottom:24px;">
              如果这不是你本人操作，可以直接忽略这封邮件，你的账号依然安全。
            </div>
            <a
              href="${url}"
              style="display:inline-block;background-color:#111827;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;line-height:20px;padding:14px 24px;border-radius:10px;margin-bottom:24px;"
            >
              立即重置密码
            </a>
            <div style="font-size:13px;line-height:22px;color:#6b7280;margin-bottom:8px;">
              如果按钮无法点击，请复制下面的链接到浏览器打开：
            </div>
            <div style="word-break:break-all;font-size:13px;line-height:22px;">
              <a href="${url}" style="color:#2563eb;text-decoration:none;">${url}</a>
            </div>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;line-height:20px;color:#9ca3af;">
              本邮件由 ${serverName} 系统发送${companyName ? `，运营主体为 ${companyName}` : ""}，请妥善保管账户信息并谨防钓鱼链接。
            </div>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    return console.error("[sendPasswordResetEmail] 发送失败", {
      error,
      from,
      to,
      subject,
    });
  }

  console.log({ data });
}

export async function sendVerificationCode({
  to,
  code,
}: {
  to: string;
  code: string;
}) {
  const from = `${serverName} <no-reply@${serverDomain}>`;

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "邮箱验证码",
    text: [
      `${serverName} 邮箱验证`,
      "",
      `你的验证码是：${code}`,
      "验证码 5 分钟内有效，请勿泄露给他人。",
      "",
      "验证成功后即可正常创建简历。",
      "",
      companyName
        ? `本邮件由 ${serverName} 发送，运营主体为 ${companyName}。`
        : `本邮件由 ${serverName} 发送。`,
    ].join("\n"),
    html: `
      <div style="margin:0;padding:0;background-color:#f6f9fc;font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;">
        <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
          <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:40px 32px;box-sizing:border-box;">
            <div style="font-size:24px;line-height:32px;font-weight:700;color:#111827;margin-bottom:16px;">
              ${serverName} 邮箱验证
            </div>
            <div style="font-size:15px;line-height:24px;color:#4b5563;margin-bottom:12px;">
              欢迎注册 ${serverName}。请使用下面的验证码完成邮箱验证。
            </div>
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;font-size:36px;line-height:48px;font-weight:700;letter-spacing:10px;color:#203dcb;background:#f3f4f6;border-radius:12px;padding:8px 20px;">
                ${code}
              </span>
            </div>
            <div style="font-size:13px;line-height:22px;color:#6b7280;margin-bottom:8px;">
              验证码 5 分钟内有效，请勿将验证码泄露给他人。
            </div>
            <div style="font-size:13px;line-height:22px;color:#6b7280;margin-bottom:24px;">
              如果这不是你本人操作，可以直接忽略这封邮件。
            </div>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;line-height:20px;color:#9ca3af;">
              本邮件由 ${serverName}${serverDomain ? `（${serverDomain}）` : ""} 系统发送${companyName ? `，运营主体为 ${companyName}` : ""}，请妥善保管账户信息并谨防钓鱼链接。
            </div>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    return console.error("[sendVerificationCode] 发送失败", {
      error,
      from,
      to,
    });
  }

  console.log({ data });
}
