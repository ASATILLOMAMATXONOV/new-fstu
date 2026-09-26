import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="container">
      <h1>404</h1>

      <p>Sahifa topilmadi.</p>

      <Link to="/">
        Bosh sahifaga qaytish
      </Link>
    </section>
  );
}