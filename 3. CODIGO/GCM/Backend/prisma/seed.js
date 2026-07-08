const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    console.log("Comenzando el sembrado de datos (seeding)...");

    // Limpiar base de datos
    await prisma.mantenimiento.deleteMany({});
    await prisma.tecnico.deleteMany({});
    await prisma.cliente.deleteMany({});
    await prisma.usuario.deleteMany({});

    // 1. Crear usuarios iniciales con contraseñas encriptadas
    const hashAdmin = await bcrypt.hash("admin123", 10);
    const hashTec1 = await bcrypt.hash("tec123", 10);
    const hashCli1 = await bcrypt.hash("cli123", 10);

    const admin = await prisma.usuario.create({
        data: {
            nombre: "Administrador del Sistema",
            usuario: "admin",
            password: hashAdmin,
            rol: "Administrador"
        }
    });

    const usrTec = await prisma.usuario.create({
        data: {
            nombre: "Carlos Gómez",
            usuario: "tecnico1",
            password: hashTec1,
            rol: "Técnico"
        }
    });

    const usrCli = await prisma.usuario.create({
        data: {
            nombre: "Juan Pérez",
            usuario: "cliente1",
            password: hashCli1,
            rol: "Cliente",
            cedula: "1712345678"
        }
    });

    console.log("Usuarios creados.");

    // 2. Crear clientes
    const cliente1 = await prisma.cliente.create({
        data: {
            cedula: "1712345678",
            nombre: "Juan Pérez",
            correo: "juan.perez@mail.com",
            telefono: "0987654321",
            direccion: "Av. Amazonas y Colón"
        }
    });

    const cliente2 = await prisma.cliente.create({
        data: {
            cedula: "1787654321",
            nombre: "María Rodríguez",
            correo: "maria.rod@mail.com",
            telefono: "0991122334",
            direccion: "Calle 10 de Agosto y Patria"
        }
    });

    const cliente3 = await prisma.cliente.create({
        data: {
            cedula: "0912345678",
            nombre: "Sofía Martínez",
            correo: "sofia.mtz@mail.com",
            telefono: "0995566778",
            direccion: "C.C. El Recreo"
        }
    });

    console.log("Clientes creados.");

    // 3. Crear técnicos
    const tecnico1 = await prisma.tecnico.create({
        data: {
            nombre: "Carlos Gómez",
            especialidad: "Dispositivos Móviles",
            correo: "carlos@mantenimiento.com",
            telefono: "0988888888"
        }
    });

    const tecnico2 = await prisma.tecnico.create({
        data: {
            nombre: "Diana López",
            especialidad: "Computadoras y Redes",
            correo: "diana@mantenimiento.com",
            telefono: "0977777777"
        }
    });

    console.log("Técnicos creados.");

    // 4. Crear mantenimientos
    await prisma.mantenimiento.create({
        data: {
            tipo: "Celular",
            descripcion: "iPhone 13 Pro - Falla en pin de carga y módulo de cámara principal rayado. No se conecta a redes Wi-Fi.",
            fecha: new Date("2026-06-01"),
            estado: "En Reparación",
            costo: 150.00,
            clienteId: cliente1.id,
            tecnicoId: tecnico1.id
        }
    });

    await prisma.mantenimiento.create({
        data: {
            tipo: "Tablet",
            descripcion: "iPad Air 5 - Pantalla trisada y Touch ID inoperable debido al golpe.",
            fecha: new Date("2026-06-05"),
            estado: "Listo para Entrega",
            costo: 220.00,
            clienteId: cliente1.id,
            tecnicoId: tecnico1.id
        }
    });

    await prisma.mantenimiento.create({
        data: {
            tipo: "Laptop",
            descripcion: "Laptop XPS 15 - No enciende. Posible cortocircuito en placa madre después de sobretensión eléctrica.",
            fecha: new Date("2026-06-10"),
            estado: "Recibido",
            costo: 350.00,
            clienteId: cliente2.id,
            tecnicoId: tecnico2.id
        }
    });

    console.log("Mantenimientos creados.");
    console.log("¡Sembrado de base de datos finalizado con éxito!");
}

main()
    .catch((e) => {
        console.error("Error durante el seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
