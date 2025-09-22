"use client";

import React, { useMemo } from "react";
import type { Appointment, Professional, Service } from "../../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek,
  getDay,
  getHours,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CSVLink } from "react-csv";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ReportsTabProps {
  data: Appointment[];
  loading: boolean;
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  professionals: Professional[];
  services: Service[];
}

const ReportFilters = ({
  dateRange,
  onDateRangeChange,
  disabled,
}: {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  disabled: boolean;
}) => {
  const setDatePreset = (preset: "this_month" | "last_month" | "this_week") => {
    const today = new Date();
    if (preset === "this_month")
      onDateRangeChange({ from: startOfMonth(today), to: endOfMonth(today) });
    if (preset === "last_month") {
      const lastMonth = subMonths(today, 1);
      onDateRangeChange({
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      });
    }
    if (preset === "this_week")
      onDateRangeChange({ from: startOfWeek(today), to: endOfWeek(today) });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
        <input
          type="date"
          value={format(dateRange.from, "yyyy-MM-dd")}
          onChange={(e) =>
            onDateRangeChange({ ...dateRange, from: new Date(e.target.value) })
          }
          disabled={disabled}
          className="p-2 border border-slate-300 rounded-md"
        />
        <span className="text-slate-500 text-center md:text-left mx-2">
          até
        </span>
        <input
          type="date"
          value={format(dateRange.to, "yyyy-MM-dd")}
          onChange={(e) =>
            onDateRangeChange({ ...dateRange, to: new Date(e.target.value) })
          }
          disabled={disabled}
          className="p-2 border border-slate-300 rounded-md"
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setDatePreset("this_week")}
          disabled={disabled}
          className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md whitespace-nowrap"
        >
          Esta Semana
        </button>
        <button
          onClick={() => setDatePreset("this_month")}
          disabled={disabled}
          className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md whitespace-nowrap"
        >
          Este Mês
        </button>
        <button
          onClick={() => setDatePreset("last_month")}
          disabled={disabled}
          className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md whitespace-nowrap"
        >
          Mês Passado
        </button>
      </div>
    </div>
  );
};

// Função auxiliar para cortar o texto das legendas do eixo Y
const truncateTick = (tick: string, maxLength: number) => {
  if (tick.length > maxLength) {
    return `${tick.substring(0, maxLength)}...`;
  }
  return tick;
};

export default function ReportsTab({
  data,
  loading,
  dateRange,
  onDateRangeChange,
  professionals,
  services,
}: ReportsTabProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const processedData = useMemo(() => {
    const confirmedAppointments = data.filter((a) => a.status === "confirmado");
    const totalRevenue = confirmedAppointments.reduce(
      (acc, curr) => acc + curr.price,
      0
    );

    const revenueByService = services
      .map((service) => ({
        name: service.name,
        Faturamento: confirmedAppointments
          .filter((a) => a.serviceId === service.id)
          .reduce((acc, curr) => acc + curr.price, 0),
      }))
      .filter((item) => item.Faturamento > 0)
      .sort((a, b) => b.Faturamento - a.Faturamento);

    const appointmentsByDay = confirmedAppointments.reduce((acc, curr) => {
      const day = format(curr.dateTime.toDate(), "dd/MM", { locale: ptBR });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const appointmentsByDayChartData = Object.entries(appointmentsByDay).map(
      ([name, Agendamentos]) => ({ name, Agendamentos })
    );

    const revenueByProfessional = professionals
      .map((prof) => ({
        name: prof.firstName,
        Faturamento: confirmedAppointments
          .filter((a) => a.professionalId === prof.id)
          .reduce((acc, curr) => acc + curr.price, 0),
      }))
      .filter((item) => item.Faturamento > 0)
      .sort((a, b) => b.Faturamento - a.Faturamento);

    const heatmapData = confirmedAppointments.reduce((acc, curr) => {
      const date = curr.dateTime.toDate();
      const dayOfWeek = getDay(date);
      const hour = getHours(date);
      if (!acc[dayOfWeek]) acc[dayOfWeek] = {};
      if (!acc[dayOfWeek][hour]) acc[dayOfWeek][hour] = 0;
      acc[dayOfWeek][hour]++;
      return acc;
    }, {} as Record<number, Record<number, number>>);

    return {
      totalRevenue,
      revenueByService,
      appointmentsByDayChartData,
      revenueByProfessional,
      heatmapData,
    };
  }, [data, services, professionals]);

  const csvData = useMemo(() => {
    return data.map((apt) => ({
      Data: format(apt.dateTime.toDate(), "dd/MM/yyyy HH:mm"),
      Serviço: apt.serviceName,
      Profissional:
        professionals.find((p) => p.id === apt.professionalId)?.firstName ||
        "N/A",
      Cliente: `${apt.clientFirstName} ${apt.clientLastName}`,
      Preço: apt.price.toFixed(2),
      Status: apt.status,
    }));
  }, [data, professionals]);

  // Variáveis dinâmicas para o layout responsivo dos gráficos
  const yAxisWidth = isMobile ? 65 : 100;
  const chartMargin = isMobile
    ? { top: 5, right: 20, left: 5, bottom: 20 }
    : { top: 5, right: 30, left: 20, bottom: 20 };
  const yAxisTickStyle = isMobile ? { fontSize: 10 } : { fontSize: 12 };

  if (loading)
    return <div className="text-center p-8">A carregar relatórios...</div>;

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const operatingHours = Array.from({ length: 12 }, (_, i) => i + 8);

  const getHeatmapColor = (count: number = 0) => {
    if (count === 0) return "bg-slate-100 text-slate-500";
    if (count <= 2) return "bg-teal-100 text-teal-800";
    if (count <= 5) return "bg-teal-300 text-teal-900";
    return "bg-teal-600 text-white";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
        <CSVLink
          data={csvData}
          filename={`relatorio_agendamentos_${format(
            new Date(),
            "yyyy-MM-dd"
          )}.csv`}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 text-center"
        >
          Exportar para CSV
        </CSVLink>
      </div>

      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        disabled={loading}
      />

      <section className="space-y-6">
        <h3 className="text-2xl font-semibold text-slate-800 border-b pb-2">
          Financeiro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-slate-500">Faturamento Total no Período</p>
            <p className="text-4xl font-bold text-teal-600">
              {processedData.totalRevenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-slate-500">Total de Agendamentos Confirmados</p>
            <p className="text-4xl font-bold text-indigo-600">
              {data.filter((a) => a.status === "confirmado").length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-bold mb-4">Faturamento por Serviço</h4>
          <ResponsiveContainer width="100%" height={isMobile ? 500 : 400}>
            <BarChart
              data={processedData.revenueByService}
              layout="vertical"
              margin={chartMargin}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                }
              />
              <Legend />
              <Bar dataKey="Faturamento" fill="#14b8a6" />
              <YAxis
                dataKey="name"
                type="category"
                width={yAxisWidth}
                tick={yAxisTickStyle}
                interval={0}
                tickFormatter={(value) =>
                  truncateTick(value, isMobile ? 10 : 18)
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-bold mb-4">Faturamento por Profissional</h4>
          <ResponsiveContainer width="100%" height={isMobile ? 500 : 400}>
            <BarChart
              data={processedData.revenueByProfessional}
              layout="vertical"
              margin={chartMargin}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                }
              />
              <Legend />
              <Bar dataKey="Faturamento" fill="#4f46e5" />
              <YAxis
                dataKey="name"
                type="category"
                width={yAxisWidth}
                tick={yAxisTickStyle}
                interval={0}
                tickFormatter={(value) =>
                  truncateTick(value, isMobile ? 10 : 18)
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-semibold text-slate-800 border-b pb-2">
          Operacional
        </h3>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-bold mb-4">Horários de Pico</h4>
          <p className="text-sm text-slate-500 mb-4">
            Visualize os dias e horários com maior volume de agendamentos.
            Quanto mais escuro, maior o movimento.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="p-1 sm:p-2 border">Hora</th>
                  {weekDays.map((day) => (
                    <th key={day} className="p-1 sm:p-2 border">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {operatingHours.map((hour) => (
                  <tr key={hour}>
                    <td className="p-1 sm:p-2 border font-semibold">{`${hour
                      .toString()
                      .padStart(2, "0")}:00`}</td>
                    {weekDays.map((_, dayIndex) => (
                      <td
                        key={`${hour}-${dayIndex}`}
                        className={`p-1 sm:p-2 border font-bold ${getHeatmapColor(
                          processedData.heatmapData[dayIndex]?.[hour]
                        )}`}
                      >
                        {processedData.heatmapData[dayIndex]?.[hour] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-bold mb-4">Volume de Agendamentos no Período</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={processedData.appointmentsByDayChartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={
                  isMobile
                    ? Math.ceil(
                        processedData.appointmentsByDayChartData.length / 5
                      )
                    : 0
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Agendamentos"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
