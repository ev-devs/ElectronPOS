import usb.core
import usb.util

dev = usb.core.find(idVendor = 0x1538, idProduct = 0x8852)
dev.set_configuration()

print dev.read()
