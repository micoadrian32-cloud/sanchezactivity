import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '../firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
} from 'firebase/firestore';

type Student = {
    id: string;
    student_id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
};

export default function Dashboard() {
    const [students, setStudents] = React.useState<Student[]>([]);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const totalStudents = students.length;
    const studentsWithPhone = students.filter((student) => student.phone).length;
    const studentsWithAddress = students.filter((student) => student.address).length;

    const form = useForm({
        student_id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    React.useEffect(() => {
        const studentsRef = collection(db, 'students');

        const unsubscribe = onSnapshot(
            studentsRef,
            (snapshot) => {
                const data = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...(docSnap.data() as Omit<Student, 'id'>),
                }));

                setStudents(data);
                setLoading(false);
                setError(null);
            },
            (firestoreError) => {
                setLoading(false);
                setError(firestoreError.message);
            },
        );

        return () => unsubscribe();
    }, []);

    function resetForm() {
        setEditingId(null);
        form.reset();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const studentData = {
                student_id: form.data.student_id,
                name: form.data.name,
                email: form.data.email,
                phone: form.data.phone || null,
                address: form.data.address || null,
            };

            if (editingId) {
                await updateDoc(doc(db, 'students', editingId), studentData);
            } else {
                await addDoc(collection(db, 'students'), studentData);
            }

            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(student: Student) {
        setEditingId(student.id);
        form.setData({
            student_id: student.student_id,
            name: student.name,
            email: student.email,
            phone: student.phone ?? '',
            address: student.address ?? '',
        });
    }

    async function handleDelete(studentId: string) {
        if (!window.confirm('Are you sure you want to delete this student?')) {
            return;
        }

        setError(null);

        try {
            await deleteDoc(doc(db, 'students', studentId));

            if (editingId === studentId) {
                resetForm();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to delete student.');
        }
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff_100%)]">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                Student management
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                Dashboard
                            </h1>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                                Total records
                            </p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900">{totalStudents}</span>
                                <span className="text-sm text-slate-500">students</span>
                            </div>
                        </div>
                    </header>

                    <div className="mb-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Students</p>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-3xl font-bold text-slate-900">{totalStudents}</span>
                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    Active
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">With phone</p>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-3xl font-bold text-slate-900">{studentsWithPhone}</span>
                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                    Contacted
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">With address</p>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-3xl font-bold text-slate-900">{studentsWithAddress}</span>
                                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
                                    Located
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        {editingId !== null ? 'Edit student' : 'Add student'}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        {editingId !== null ? 'Update student details' : 'Create a new student profile'}
                                    </p>
                                </div>

                                {editingId !== null && (
                                    <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                                        Cancel
                                    </Button>
                                )}
                            </div>

                            {error && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                                    <div>
                                        <label htmlFor="student_id" className="mb-2 block text-sm font-medium text-slate-700">
                                            Student ID
                                        </label>
                                        <Input
                                            id="student_id"
                                            name="student_id"
                                            type="text"
                                            value={form.data.student_id}
                                            onChange={(e) => form.setData('student_id', e.target.value)}
                                            className="mt-0 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            className="mt-0 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.data.email}
                                            onChange={(e) => form.setData('email', e.target.value)}
                                            className="mt-0 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                                            Phone
                                        </label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="text"
                                            value={form.data.phone}
                                            onChange={(e) => form.setData('phone', e.target.value)}
                                            className="mt-0 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-700">
                                        Address
                                    </label>
                                    <Input
                                        id="address"
                                        name="address"
                                        type="text"
                                        value={form.data.address}
                                        onChange={(e) => form.setData('address', e.target.value)}
                                        className="mt-0 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={saving || form.processing}
                                        className="h-11 w-full rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                                    >
                                        {saving ? 'Saving...' : editingId !== null ? 'Update student' : 'Add student'}
                                    </Button>
                                </div>
                            </form>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Students</h2>
                                    <p className="text-sm text-slate-500">Latest student entries</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                    {loading ? 'Loading...' : `${students.length} records`}
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Student ID
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Phone
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Address
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                                                    Loading students...
                                                </td>
                                            </tr>
                                        ) : students.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                                                    No students found.
                                                </td>
                                            </tr>
                                        ) : (
                                            students.map((student) => (
                                                <tr key={student.id} className="transition-colors hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-700">
                                                        {student.student_id}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{student.name}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{student.email}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{student.phone ?? '—'}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">{student.address ?? '—'}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(student)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(student.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
