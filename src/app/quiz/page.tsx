import { QuizForm } from "./QuizForm";

export const metadata = {
  title: "Diagnóstico",
};

export default function QuizPage() {
  return (
    <main className="quiz-screen">
      <QuizForm />
    </main>
  );
}
