/**
 * Điểm export các UI primitive dùng chung cho site public lẫn admin (Button, Badge, Card, Spinner, Modal).
 * Dùng bởi: `import { Button, Card } from "@/components/ui"` (hiện chưa có trang nào dùng; hướng dẫn ở README.md cùng thư mục).
 * Lưu ý: chỉ đặt ở đây component không biết gì về nghiệp vụ (không gọi API, không import service / CMS).
 */
export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from "./Button";
export { Badge, type BadgeProps, type BadgeTone } from "./Badge";
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  type CardHeaderProps,
} from "./Card";
export { Spinner } from "./Spinner";
export { Modal, type ModalProps } from "./Modal";
