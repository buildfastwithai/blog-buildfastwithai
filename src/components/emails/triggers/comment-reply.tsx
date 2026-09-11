import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Button,
  Hr,
  Link,
  Preview,
  Row,
  Column,
} from "@react-email/components";

export const CommentReplyEmail = ({
  parentUserName,
  parentUserAvatar,
  replierName,
  replierAvatar,
  blogTitle,
  parentCommentContent,
  replyContent,
  threadUrl,
}: {
  parentUserName: string;
  parentUserAvatar?: string;
  replierName: string;
  replierAvatar?: string;
  blogTitle: string;
  parentCommentContent: string;
  replyContent: string;
  threadUrl: string;
}) => {
  const emailSubject = `New reply from ${replierName}`;

  const defaultAvatar =
    "https://auth.buildfastwithai.com/storage/v1/object/public/assets/images/user%20image.jpg";

  const LOGO =
    "https://auth.buildfastwithai.com/storage/v1/object/public/assets/email-template/dark_logo.png";

  return (
    <Html>
      <Head />
      <Preview>{emailSubject}</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          
          {/* HEADER */}
          <Section style={styles.header}>
            <Img src={LOGO} height="40" style={{ margin: "0 auto" }} />
          </Section>

          {/* CARD */}
          <Section style={styles.card}>
            
            {/* GREETING */}
            <Text style={styles.greeting}>
              Hi {parentUserName} 👋
            </Text>

            {/* INTRO */}
            <Text style={styles.introText}>
              <b>{replierName}</b> replied to your comment on{" "}
              <Link href={threadUrl} style={styles.link}>
                "{blogTitle}"
              </Link>
            </Text>

            {/* REPLY */}
            <Section style={styles.replyBox}>
              <Row>
                <Column style={{ width: "40px" }}>
                  <Img
                    src={replierAvatar || defaultAvatar}
                    width="40"
                    height="40"
                    style={styles.avatar}
                  />
                </Column>

                <Column style={{ paddingLeft: "12px" }}>
                  <Text style={styles.name}>{replierName}</Text>
                  <Text style={styles.replyText}>{replyContent}</Text>
                </Column>
              </Row>
            </Section>

            {/* ORIGINAL COMMENT */}
            <Section style={styles.parentWrapper}>
              <Text style={styles.parentLabel}>Your comment</Text>

              <Section style={styles.parentBox}>
                <Text style={styles.parentText}>
                  {parentCommentContent}
                </Text>
              </Section>
            </Section>

            {/* CTA BUTTONS */}
            <Section style={styles.buttonWrap}>

              <Button href={threadUrl} style={styles.primaryButton}>
                👉 View Reply
              </Button>

              <Text style={{ height: "10px" }} />

              <Button href={threadUrl} style={styles.secondaryButton}>
                💬 Continue Conversation
              </Button>

              <Text style={styles.helperText}>
                Join the discussion and stay updated in real-time 🚀
              </Text>

            </Section>

            <Hr style={styles.divider} />

            {/* FOOTER */}
            <Section style={styles.footer}>
              <Text style={styles.footerText}>
                Explore more AI tools & insights
              </Text>

              <Link
                href="https://blog.buildfastwithai.com"
                style={styles.footerLink}
              >
                Browse Blogs →
              </Link>

              <Text style={styles.footerSmall}>
                © 2026 BuildFastWithAI
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

/* ================= STYLES ================= */

const PRIMARY = "#2563EB";
const PRIMARY_DARK = "#1D4ED8";
const BG = "#F5F7FB";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

const styles = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: BG,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px 12px",
  },

  header: {
    backgroundColor: "#fefeffff",
    padding: "20px",
    textAlign: "center" as const,
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    border: `1px solid ${BORDER}`,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "0px",
    padding: "24px",
    border: `1px solid ${BORDER}`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },

  greeting: {
    fontSize: "20px",
    fontWeight: "700",
    color: TEXT,
    marginBottom: "8px",
  },

  introText: {
    fontSize: "14px",
    color: MUTED,
    marginBottom: "20px",
  },

  link: {
    color: PRIMARY,
    fontWeight: "600",
    textDecoration: "none",
  },

  replyBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    border: "1px solid #DBEAFE",
  },

  avatar: {
    borderRadius: "50%",
  },

  name: {
    fontSize: "14px",
    fontWeight: "600",
    color: TEXT,
    margin: "0 0 4px 0",
  },

  replyText: {
    fontSize: "14px",
    color: TEXT,
    margin: 0,
  },

  parentWrapper: {
    marginBottom: "24px",
  },

  parentLabel: {
    fontSize: "12px",
    color: MUTED,
    marginBottom: "6px",
  },

  parentBox: {
    backgroundColor: "#FAFAFA",
    borderRadius: "10px",
    padding: "14px",
    border: `1px solid ${BORDER}`,
  },

  parentText: {
    fontSize: "13px",
    color: MUTED,
    margin: 0,
    fontStyle: "italic",
  },

  buttonWrap: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },

  primaryButton: {
    background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
    color: "#fff",
    padding: "14px 26px",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    textDecoration: "none",
    display: "inline-block",
  },

  secondaryButton: {
    backgroundColor: "#EEF2FF",
    color: PRIMARY,
    padding: "12px 22px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },

  helperText: {
    fontSize: "12px",
    color: MUTED,
    marginTop: "10px",
  },

  divider: {
    borderColor: BORDER,
    margin: "24px 0",
  },

  footer: {
    textAlign: "center" as const,
  },

  footerText: {
    fontSize: "13px",
    color: MUTED,
    marginBottom: "6px",
  },

  footerLink: {
    fontSize: "14px",
    color: PRIMARY,
    textDecoration: "none",
    fontWeight: "600",
  },

  footerSmall: {
    fontSize: "11px",
    color: "#9CA3AF",
    marginTop: "12px",
  },
};

export default CommentReplyEmail;