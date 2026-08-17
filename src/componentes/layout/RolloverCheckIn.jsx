import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAccount } from '../../contexts/AccountContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

// Check-in "voce ja fez isso?" pra eventos pontuais que venceram sem
// confirmacao (ver AgendaRolloverScheduler no backend). Fica montado dentro
// do AppLayout, que so renderiza pra usuario autenticado -- busca pendencias
// uma vez ao montar; a lista naturalmente esvazia conforme o usuario
// responde (nao precisa de flag "ja mostrei hoje" em sessionStorage).
export default function RolloverCheckIn() {
  const { accountId } = useAccount();
  const [pending, setPending] = useState([]);
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    if (!accountId || accountId === 'null') return;

    let cancelled = false;
    api.get(`/agenda/account/${accountId}/rollover/pending`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!cancelled) setPending(data || []);
      })
      .catch(() => {
        // Falha em buscar pendencias nao deve travar o app -- so nao mostra o check-in.
      });

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  if (pending.length === 0) return null;

  const current = pending[0];

  const answer = async (done) => {
    setAnswering(true);
    try {
      await api.post(`/agenda/${current.id}/rollover/confirm`, { done });
    } catch {
      // Falha ao confirmar: so segue pro proximo, o item continua marcado
      // como pendente no backend e vai reaparecer na proxima abertura do app.
    } finally {
      setPending((prev) => prev.slice(1));
      setAnswering(false);
    }
  };

  return (
    <Modal isOpen title="Confere aí" onClose={() => {}}>
      <div className="flex flex-col gap-4">
        <p className="text-text">
          Você já fez <span className="font-semibold">&quot;{current.title}&quot;</span> (era de ontem)?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={answering} onClick={() => answer(false)}>
            Não
          </Button>
          <Button disabled={answering} onClick={() => answer(true)}>
            Sim
          </Button>
        </div>
      </div>
    </Modal>
  );
}
