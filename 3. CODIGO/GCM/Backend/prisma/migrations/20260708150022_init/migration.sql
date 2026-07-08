-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tecnico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,

    CONSTRAINT "Tecnico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mantenimiento" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "tecnicoId" INTEGER NOT NULL,

    CONSTRAINT "Mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "Usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cedula_key" ON "Cliente"("cedula");

-- AddForeignKey
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Tecnico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
