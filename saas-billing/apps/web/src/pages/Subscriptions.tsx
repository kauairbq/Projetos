import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api";
import type { Plan, Subscription } from "../lib/types";
import { Topbar } from "../components/Topbar";

const schema = z.object({
  userId: z.string().min(1, "ID do cliente obrigatório"),
  planId: z.string().min(1, "ID do plano obrigatório"),
  status: z.enum(["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: "",
      planId: "",
      status: "ACTIVE",
    },
  });

  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await api.get<Plan[]>("/plans");
      return data;
    },
  });

  const subsQuery = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data } = await api.get<Subscription[]>("/subscriptions");
      return data;
    },
  });

  const createSubscription = useMutation({
    mutationFn: async (payload: FormValues) => {
      const { data } = await api.post<Subscription>("/subscriptions", payload);
      return data;
    },
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

  return (
    <div>
      <Topbar title="Subscrições" description="Associações de clientes aos planos." />
      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_1.9fr]">
        <form
          className="card space-y-4"
          onSubmit={form.handleSubmit((values) => createSubscription.mutate(values))}
        >
          <div>
            <label className="text-sm font-semibold">ID do cliente</label>
            <input className="input mt-1" {...form.register("userId")} />
            <p className="text-xs text-rose-500">{form.formState.errors.userId?.message}</p>
          </div>
          <div>
            <label className="text-sm font-semibold">Plano</label>
            <select className="input mt-1" {...form.register("planId")}>
              <option value="">Selecionar</option>
              {plansQuery.data?.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-rose-500">{form.formState.errors.planId?.message}</p>
          </div>
          <div>
            <label className="text-sm font-semibold">Estado</label>
            <select className="input mt-1" {...form.register("status")}>
              <option value="ACTIVE">Ativa</option>
              <option value="TRIALING">Trial</option>
              <option value="PAST_DUE">Atrasada</option>
              <option value="CANCELED">Cancelada</option>
            </select>
          </div>
          <button className="btn btn-primary w-full" type="submit">
            {createSubscription.isPending ? "A criar..." : "Criar subscrição"}
          </button>
        </form>

        <div className="card">
          <h3 className="text-lg font-semibold">Subscrições ativas</h3>
          <table className="table mt-4">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plano</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subsQuery.data?.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.userId.slice(0, 8)}...</td>
                  <td>{sub.plan?.name ?? sub.planId.slice(0, 8)}</td>
                  <td>{sub.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
